import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SearchProductsQuery } from "../impl/get-search-products";
import { SearchProductsQueryOutputDto } from "src/product/dtos/get-search-out.dto";
import { ProductView, ProductViewRepository, SortByOption } from "src/product/repositories/product-view.repository";
import { RedisGeo } from "src/product/util/geoadd";
@QueryHandler(SearchProductsQuery)
export class SearchProductsHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly configService: ConfigService,
    private readonly redisGeo: RedisGeo,
    private readonly logger: Logger
  ) {}

  async execute(query: SearchProductsQuery): Promise<SearchProductsQueryOutputDto> {
    this.logger.log(`Executing search products query with parameters: ${JSON.stringify(query)}`);
    const { searchTerm } = query;

    if (!searchTerm) {
      throw new Error("searchTerm is required.");
    }

    const items = await this.productViewRepository.fetchItemsBySearchTerm(searchTerm);
    
    const processedItems = await this.processItems(items, query);
    const paginatedResult = this.paginateItems(processedItems, query.limit, query.exclusiveStartKey);
    const formattedResult = this.formatResult(paginatedResult, query);

    this.logger.log(`Query result: ${formattedResult.count} items found`);

    return formattedResult;
  }

  private async processItems(items: ProductView[], query: {
    sortBy: SortByOption;
    order: 'asc' | 'desc';
    latitude?: string;
    longitude?: string;
  }): Promise<ProductView[]> {
    // Always calculate distances
    const processedItems = await this.calculateDistances(
      items,
      Number(query.latitude) || 0,
      Number(query.longitude) || 0,
      query.sortBy
    );

    return this.sortItems(processedItems, query.sortBy, query.order);
  }

  async calculateDistances(
    items: ProductView[],
    userLatitude: number,
    userLongitude: number,
    sortBy: SortByOption
  ): Promise<ProductView[]> {
    const batchSize = 50;
    const calculatedItems: ProductView[] = [];
  
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const locations = batch
        .filter(item => item.locationX && item.locationY)
        .map(item => ({
          id: item.productId,
          latitude: Number(item.locationY),
          longitude: Number(item.locationX)
        }));
  
      const distanceResults = await this.redisGeo.calculateDistance(
        userLatitude,
        userLongitude,
        locations
      );
  
      for (const item of batch) {
        if (item.locationX && item.locationY) {
          const distanceResult = distanceResults.find(r => r.id === item.productId);
          if (distanceResult) {
            const distanceInKm = parseFloat(distanceResult.distance) / 10; // 여기서 10으로 나눔
            const score = this.calculateRecommendationScore({ ...item, distance: distanceInKm });
            calculatedItems.push({ ...item, distance: distanceInKm, distanceDiscountScore: score });
          } else {
            this.logger.warn(`No distance result for item ${item.productId}`);
            calculatedItems.push({ ...item, distance: Infinity, distanceDiscountScore: 0 });
          }
        } else {
          calculatedItems.push({ ...item, distance: Infinity, distanceDiscountScore: 0 });
        }
      }
    }
  
    return calculatedItems;
  }
  
  private calculateRecommendationScore(product: ProductView & { distance: number }): number {
    const distanceScore = 1 / (1 + (product.distance || Infinity));
    const discountScore = (product.discountRate || 0) / 100;
    const score = (distanceScore + discountScore) / 2;
    return Math.round(score * 100);
  }

  private sortItems(items: ProductView[], sortBy: SortByOption, order: 'asc' | 'desc'): ProductView[] {
    return items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case SortByOption.DiscountRate:
          comparison = (b.discountRate || 0) - (a.discountRate || 0);
          break;
        case SortByOption.Distance:
          comparison = (a.distance || Infinity) - (b.distance || Infinity);
          break;
        case SortByOption.DistanceDiscountScore:
          comparison = (b.distanceDiscountScore || 0) - (a.distanceDiscountScore || 0);
          break;
      }
      if (comparison === 0) {
        // 주 정렬 기준이 같을 경우, 거리를 부차적인 정렬 기준으로 사용
        return (a.distance || Infinity) - (b.distance || Infinity);
      }
      return order === 'desc' ? comparison : -comparison;
    });
  }

  private paginateItems(items: ProductView[], limit: number, exclusiveStartKey?: string): { items: ProductView[], lastEvaluatedKey: any } {
    let startIndex = 0;
    if (exclusiveStartKey) {
      const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
      startIndex = items.findIndex(item => item.productId === startKey.productId);
      startIndex = startIndex === -1 ? 0 : startIndex + 1;
    }
  
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const lastEvaluatedKey = paginatedItems.length === limit ? { productId: paginatedItems[paginatedItems.length - 1].productId } : null;
  
    return { items: paginatedItems, lastEvaluatedKey };
  }

  private formatResult(
    result: { items: ProductView[], lastEvaluatedKey: any },
    query: SearchProductsQuery
  ): SearchProductsQueryOutputDto {
    const { searchTerm, sortBy, order, limit, latitude, longitude, previousPageKey } = query;
    const { items, lastEvaluatedKey } = result;

    const appUrl = this.configService.get<string>('APP_URL');
    const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
      if (!key || !appUrl) return null;
      const baseUrl = new URL("/api/products/search", appUrl);
      baseUrl.searchParams.append('searchTerm', searchTerm);
      baseUrl.searchParams.append('sortBy', sortBy);
      baseUrl.searchParams.append('order', order);
      baseUrl.searchParams.append('limit', limit.toString());
      if (latitude) baseUrl.searchParams.append('latitude', latitude);
      if (longitude) baseUrl.searchParams.append('longitude', longitude);
      baseUrl.searchParams.append('exclusiveStartKey', encodeURIComponent(JSON.stringify(key)));
      if (prevKey) {
        baseUrl.searchParams.append('previousPageKey', encodeURIComponent(prevKey));
      }
      return baseUrl.toString();
    };

    const firstEvaluatedKey = items.length > 0 ? { productId: items[0].productId } : null;
    const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey, previousPageKey);
    const lastEvaluatedUrl = lastEvaluatedKey ? createUrlWithKey(lastEvaluatedKey, JSON.stringify(firstEvaluatedKey)) : null;

    let prevPageUrl: string | null = null;
    if (previousPageKey) {
      const prevKey = JSON.parse(decodeURIComponent(previousPageKey));
      prevPageUrl = createUrlWithKey(prevKey, null);
    }

    return {
      success: true,
      message: '검색된 상품 리스트 조회를 성공했습니다.',
      items,
      lastEvaluatedUrl,
      firstEvaluatedUrl,
      prevPageUrl,
      count: items.length
    };
  }
}