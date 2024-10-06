import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Item, Model, QueryResponse, ScanResponse } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { DistanceCalculator } from "../util/distance-calculator";
import { Polygon } from "typeorm";
import { Category } from "../product.category";

export enum SortByOption {
  DiscountRate = 'discountRate',
  Distance = 'distance',
  DistanceDiscountScore = 'distanceDiscountScore'
}

export interface ProductView {
  productId: string;
  GSI_KEY: string; 
  sellerId: string;
  category: string;
  name: string;
  productImageUrl: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  availableStock: number;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  locationX: string;
  locationY: string;
  distance: number;
  distanceDiscountScore: number;
}
type ProductViewItem = Item<ProductView> & ProductView;


@Injectable()
export class ProductViewRepository {

  private readonly logger = new Logger(ProductViewRepository.name);

  constructor(
    @InjectModel("ProductView")
    private readonly productViewModel: Model<
      ProductView,
      { productId: string }
    >,
    private readonly configService: ConfigService
  ) { }

  // 상품 생성
  async create(productView: ProductView): Promise<ProductView> {
    try {
      this.logger.log(`ProductView 생성: ${productView.productId}`);
      this.logger.log(`Attempting to create ProductView: ${JSON.stringify(productView)}`);
      return await this.productViewModel.create(productView);
    } catch (error) {
      this.logger.error(`ProductView 생성 실패: ${error.message}`, error.stack);
      this.logger.error(`Failed to create ProductView: ${JSON.stringify(productView)}`, error.stack);

      throw error;
    }
  }

  // 상품 수정
  async update(
    productId: string,
    updates: Partial<ProductView>,
  ): Promise<ProductView | null> {
    try {
      this.logger.log(`ProductView 업데이트: productId=${productId}`);
      const updatedProduct = await this.productViewModel.update(
        { productId },
        updates,
        { return: "item" },
      );
      this.logger.log(
        `ProductView 업데이트 성공: ${JSON.stringify(updatedProduct)}`,
      );
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `ProductView 업데이트 실패: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  // 상품 삭제
  async delete({ productId }: { productId: string }): Promise<void> {
    try {
      this.logger.log(`ProductView 삭제: productId=${productId}`);
      await this.productViewModel.delete({ productId });
    } catch (error) {
      this.logger.error(`ProductView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 상품ID로 단건 조회
  async findByProductId(productId: string): Promise<ProductView | null> {
    try {
      this.logger.log(`ProductView 조회: productId=${productId}`);
      return await this.productViewModel.get({ productId });
    } catch (error) {
      this.logger.error(`ProductView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  findById(id: string): ProductView | PromiseLike<ProductView> {
    throw new Error("Method not implemented.");
  }

  // 판매자ID로 상품 목록 조회
  async findAllProductsBySellerId(sellerId: string): Promise<ProductView[]> {
    try {
      this.logger.log(`ProductView 조회: sellerId=${sellerId}`);
      const results = await this.productViewModel
        .query("sellerId")
        .eq(sellerId)
        .exec();
      return results;
    } catch (error) {
      this.logger.error(`ProductView 조회 실패: ${error.message}`, error.stack);
      return [];
    }
  }

  // 카테고리로 상품 목록 조회
  async findProductsByCategory(category: string): Promise<ProductView[]> {
    try {
      this.logger.log(`ProductView 조회: category=${category}`);
      const results = await this.productViewModel
        .query("category")
        .eq(category)
        .exec();
      return results;
    } catch (error) {
      this.logger.error(`ProductView 조회 실패: ${error.message}`, error.stack);
      return [];
    }
  }
  // 모든 상품 조회
  async findAll(): Promise<ProductView[]> {
    try {
      this.logger.log('모든 ProductView 조회');
      const result = await this.productViewModel.scan().exec();
      return result;
    } catch (error) {
      this.logger.error(`모든 ProductView 조회 실패: ${error.message}`, error.stack);
      throw new InternalServerErrorException('모든 상품 조회 중 오류가 발생했습니다.');
    }
  }


  //할인률 조회
  async findProductsByDiscountRate(
    param: {
      order: 'asc' | 'desc';
      limit: number;
      exclusiveStartKey?: string;
      previousPageKey?: string; // 이전 페이지 키 추가
    }
  ): Promise<{
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null; // 이전 페이지 URL 추가
    count: number;
  }> {
    try {
      const { order, limit, exclusiveStartKey, previousPageKey } = param;
      const sortOrder = order === 'desc' ? SortOrder.descending : SortOrder.ascending;
      let startKey: Record<string, any> | undefined;

      if (exclusiveStartKey) {
        startKey = JSON.parse(exclusiveStartKey);
      }

      let query = this.productViewModel
        .query('GSI_KEY')
        .eq('PRODUCT')
        .using('DiscountRateIndex');

      if (startKey && startKey.discountRate !== undefined) {
        if (sortOrder === SortOrder.ascending) {
          query = query.where('discountRate').ge(startKey.discountRate);
        } else {
          query = query.where('discountRate').le(startKey.discountRate);
        }
      }

      query = query.sort(sortOrder).limit(Number(8) + 1); // 한 개 더 가져옵니다.

      const results: QueryResponse<ProductView> = await query.exec();
      const items = Array.from(results).slice(0, Number(8)); // 원하는 개수만큼 잘라냅니다.

      this.logger.log(`Pagination query result: ${items.length} items`);

      // 첫 번째 키 설정 (이전 페이지로 돌아가기 위한 키)
      let firstEvaluatedKey;
      if (previousPageKey) {
        firstEvaluatedKey = JSON.parse(previousPageKey);
      } else if (items.length > 0) {
        firstEvaluatedKey = {
          productId: items[0].productId,
          GSI_KEY: 'PRODUCT',
          discountRate: items[0].discountRate,
        };
      } else {
        firstEvaluatedKey = null;
      }

      // 마지막 평가된 키 설정 (다음 페이지로 가기 위한 키)
      const lastEvaluatedKey = results.lastKey || null;

      const appUrl = this.configService.get<string>('APP_URL');
      const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
        if (!key || !appUrl) return null;
        const baseUrl = new URL("/api/products/discountrate", appUrl);
        baseUrl.searchParams.append('order', order);
        baseUrl.searchParams.append('limit', limit.toString());
        baseUrl.searchParams.append('exclusiveStartKey', JSON.stringify(key));
        if (prevKey) {
          baseUrl.searchParams.append('previousPageKey', prevKey);
        }
        return baseUrl.toString();
      };

      const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey, previousPageKey);//현재 처음 키와 이전키를 합쳐서 만듬
      const lastEvaluatedUrl = createUrlWithKey(lastEvaluatedKey, JSON.stringify(firstEvaluatedKey));// 마지막키와 현재 처음키를 합침

      let prevPageUrl: string | null = null;
      if (previousPageKey) {
        prevPageUrl = createUrlWithKey(JSON.parse(previousPageKey), null);
      }

      return {
        items,
        lastEvaluatedUrl,
        firstEvaluatedUrl,
        prevPageUrl,
        count: items.length,
      };
    } catch (error) {
      this.logger.error(`Pagination query failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  
  async findProductsByCategoryAndSort(param: {
    category: Category;
    sortBy: SortByOption;
    order: 'asc' | 'desc';
    limit: number;
    exclusiveStartKey?: string;
    previousPageKey?: string;
    latitude?: string;
    longitude?: string;
  }): Promise<{
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number
  }> {
    const { category, sortBy, order, limit, exclusiveStartKey, previousPageKey, latitude, longitude } = param;
    
    let items: ProductView[];
  
    if (category === Category.ALL) {
      // 모든 카테고리의 제품을 가져옵니다
      items = await this.productViewModel.scan().exec();
    } else {
      // 특정 카테고리로 필터링
      const query = this.productViewModel.query('category').eq(category);
      items = await query.exec();
    }
  
    // 거리 관련 정렬일 경우 거리 계산
    if ((sortBy === SortByOption.Distance || sortBy === SortByOption.DistanceDiscountScore) && latitude && longitude) {
      const userLocation = this.createPolygonFromCoordinates(Number(latitude), Number(longitude));
      items = await this.calculateDistances(items, userLocation);
    }
  
    // 정렬 적용
    items = this.sortItems(items, sortBy, order);
  
    // 페이지네이션 적용
    const { paginatedItems, lastEvaluatedKey } = this.applyPagination(items, limit, exclusiveStartKey);
  
    return this.formatResult(paginatedItems, lastEvaluatedKey, category, sortBy, order, limit, latitude, longitude, previousPageKey);
  }
  
  private async calculateDistances(items: ProductView[], userLocation: Polygon): Promise<ProductView[]> {
    return Promise.all(items.map(async (item) => {
      if (item.locationX && item.locationY) {
        const itemLocation = this.createPolygonFromCoordinates(Number(item.locationX), Number(item.locationY));
        const distance = DistanceCalculator.vincentyDistance(userLocation, itemLocation);
        const score = this.calculateRecommendationScore({...item, distance});
        
        await this.updateItemWithDistanceAndScore(item.productId, distance, score);
        return { ...item, distance, distanceDiscountScore: score };
      }
      return item;
    }));
  }
  
  private sortItems(items: ProductView[], sortBy: SortByOption, order: 'asc' | 'desc'): ProductView[] {
    console.log('Before sorting:', items.map(item => item.discountRate)); // Debugging line
  
    return items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case SortByOption.DiscountRate:
          comparison = (b.discountRate || 0) - (a.discountRate || 0);
          break;
        case SortByOption.Distance:
          comparison = (b.distance || Infinity) - (a.distance || Infinity);
          break;
        case SortByOption.DistanceDiscountScore:
          comparison = (b.distanceDiscountScore || -Infinity) - (a.distanceDiscountScore || -Infinity);
          break;
        default:
          comparison = 0;
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }
  
  
  private applyPagination(items: ProductView[], limit: number, exclusiveStartKey?: string): { paginatedItems: ProductView[], lastEvaluatedKey: any } {
    let startIndex = 0;
    if (exclusiveStartKey) {
      const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
      startIndex = items.findIndex(item => item.productId === startKey.productId);
      startIndex = startIndex === -1 ? 0 : startIndex + 1;
    }
  
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const lastEvaluatedKey = paginatedItems.length === limit ? { productId: paginatedItems[paginatedItems.length - 1].productId } : null;
  
    return { paginatedItems, lastEvaluatedKey };
  }
  
  private formatResult(
    items: ProductView[],
    lastEvaluatedKey: any,
    category: Category,
    sortBy: SortByOption,
    order: 'asc' | 'desc',
    limit: number,
    latitude?: string,
    longitude?: string,
    previousPageKey?: string
  ) {
    const appUrl = this.configService.get<string>('APP_URL');
    const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
      if (!key || !appUrl) return null;
      const baseUrl = new URL("/api/products/category", appUrl);
      baseUrl.searchParams.append('category', category);
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
      items,
      lastEvaluatedUrl,
      firstEvaluatedUrl,
      prevPageUrl,
      count: items.length
    };
  }
  
  async searchProducts(param: {
    searchTerm: string;
    sortBy: SortByOption;
    order: 'asc' | 'desc';
    limit: number;
    exclusiveStartKey?: string;
    previousPageKey?: string;
    latitude?: string;
    longitude?: string;
  }): Promise<{
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number
  }> {
    const { searchTerm, sortBy, order, limit, exclusiveStartKey, previousPageKey, latitude, longitude } = param;
    
    if (!searchTerm) {
      throw new Error("searchTerm is required.");
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase().trim();

    // Scan operation
    const scan = this.productViewModel.scan('GSI_KEY').eq('PRODUCT');
    
    // Apply name filter
    scan.and().where('name').contains(lowercaseSearchTerm);

    if (exclusiveStartKey) {
      const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
      scan.startAt(startKey);
    }

    scan.limit(1000); // Set a higher limit for initial scan
    let items: ProductView[] = await scan.exec();

    // 거리 관련 정렬일 경우 거리 계산
    if ((sortBy === SortByOption.Distance || sortBy === SortByOption.DistanceDiscountScore) && latitude && longitude) {
      const userLocation = this.createPolygonFromCoordinates(Number(latitude), Number(longitude));
      items = await this.calculateDistances(items, userLocation);
    }

    // 정렬 적용
    items = this.sortItems(items, sortBy, order);

    // 페이지네이션 적용
    const { paginatedItems, lastEvaluatedKey } = this.applyPagination2(items, limit, exclusiveStartKey);

    return this.formatResult2(paginatedItems, lastEvaluatedKey, searchTerm, sortBy, order, limit, latitude, longitude, previousPageKey);
  }


  private applyPagination2(items: ProductView[], limit: number, exclusiveStartKey?: string): { paginatedItems: ProductView[], lastEvaluatedKey: any } {
    let startIndex = 0;
    if (exclusiveStartKey) {
      const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
      startIndex = items.findIndex(item => item.productId === startKey.productId);
      startIndex = startIndex === -1 ? 0 : startIndex + 1;
    }

    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const lastEvaluatedKey = paginatedItems.length === limit ? { productId: paginatedItems[paginatedItems.length - 1].productId } : null;

    return { paginatedItems, lastEvaluatedKey };
  }

  private formatResult2(
    items: ProductView[],
    lastEvaluatedKey: any,
    searchTerm: string,
    sortBy: SortByOption,
    order: 'asc' | 'desc',
    limit: number,
    latitude?: string,
    longitude?: string,
    previousPageKey?: string
  ) {
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
      items,
      lastEvaluatedUrl,
      firstEvaluatedUrl,
      prevPageUrl,
      count: items.length
    };
  }

  private calculateRecommendationScore(product: ProductView): number {
    const distanceScore = 1 / (1 + (product.distance || Infinity));
    const discountScore = (product.discountRate || 0) / 100;
    const score = (distanceScore + discountScore) / 2;
    return Math.round(score * 100); // 100을 곱하여 더 의미 있는 범위의 정수로 변환
  }

  private  createPolygonFromCoordinates(latitude: number, longitude: number): Polygon {
    return {
      type: 'Polygon',
      coordinates: [[[longitude, latitude], [longitude, latitude], [longitude, latitude], [longitude, latitude]]]
    };
  }
  
  private  async updateItemWithDistanceAndScore(productId: string, distance: number, score: number) {
    await this.productViewModel.update({ productId }, { distance, distanceDiscountScore: score });
  }

  
 
}

