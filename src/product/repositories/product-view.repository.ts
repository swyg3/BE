import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model, QueryResponse, ScanResponse } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuidv4 } from 'uuid';
import { Category } from "../product.category";
import { DistanceCalculator } from "../util/distance-calculator";
import { Polygon } from "typeorm";

export interface ProductView {
  productId: string;
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

}

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
    category: string;
    sortBy: string;
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
    const sortOrder = order === 'desc' ? SortOrder.descending : SortOrder.ascending;
    let startKey: Record<string, any> | undefined;

    if (exclusiveStartKey) {
      startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
    }

    const queryLimit = Number(limit) + 1;

    let query = this.productViewModel.query('category').eq(category);

    switch (sortBy) {
      case 'discountRate':
        query = query.using('CategoryDiscountRateIndex');
        break;
      case 'distance':
        if (latitude !== undefined && longitude !== undefined) {
          const userLocation = this.createPolygonFromCoordinates(Number(latitude), Number(longitude));
          
          const items = await query.exec();
          items.forEach(item => {
            if (item.locationX !== undefined && item.locationY !== undefined) {
              const itemLocation = this.createPolygonFromCoordinates(Number(item.locationX), Number(item.locationY));
              item.distance = DistanceCalculator.vincentyDistance(userLocation, itemLocation);
            } else {
              item.distance = Infinity; // 위치 정보가 없는 경우 가장 멀리 정렬
            }
          });
          items.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          if (order === 'desc') {
            items.reverse();
          }
          return this.formatResult(items.slice(0, limit), queryLimit, sortBy, previousPageKey);
        }
        query = query.using('CategoryDistanceIndex');
        break;
      case 'distanceDiscountScore':
        query = query.using('CategoryDistanceDiscountIndex');
        break;
    }

    query = query.sort(sortOrder).limit(queryLimit);

    if (startKey && startKey[sortBy] !== undefined && startKey.category === category) {
      query = query.startAt(startKey);
    }

    const result = await query.exec();

    return this.formatResult(result, queryLimit, sortBy, previousPageKey);
  }

  private formatResult(result: ProductView[], queryLimit: number, sortBy: string, previousPageKey?: string) {
    const items = result.slice(0, queryLimit - 1);
    const lastEvaluatedUrl = result.length === queryLimit ? this.createPageUrl(result[queryLimit - 1], sortBy) : null;
    const firstEvaluatedUrl = items.length > 0 ? this.createPageUrl(items[0], sortBy) : null;
    
    let prevPageUrl = null;
    if (previousPageKey) {
      const previousItem = JSON.parse(decodeURIComponent(previousPageKey));
      prevPageUrl = this.createPageUrl(previousItem, sortBy);
    }

    return {
      items,
      lastEvaluatedUrl,
      firstEvaluatedUrl,
      prevPageUrl,
      count: items.length
    };
  }

  private createPageUrl(item: ProductView, sortBy: string): string {
    const urlParams: Record<string, any> = {
      category: item.category
    };

    switch (sortBy) {
      case 'distance':
        urlParams[sortBy] = item.distance;
        break;
      case 'discountRate':
        urlParams[sortBy] = (item as any).discountRate;
        break;
      case 'distanceDiscountScore':
        urlParams[sortBy] = (item as any).distanceDiscountScore;
        break;
      // 필요한 경우 다른 정렬 기준에 대한 case를 추가하세요
    }

    return encodeURIComponent(JSON.stringify(urlParams));
  }
 

  async searchProducts(param: {
    searchTerm: string;
    sortBy: 'discountRate' | 'distance' | 'distanceDiscountScore';
    order: 'asc' | 'desc';
    limit: number;
    exclusiveStartKey?: string;
    previousPageKey?: string;
  }): Promise<{
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number;
  }> {
    try {
      const { searchTerm, sortBy, order, limit, exclusiveStartKey, previousPageKey } = param;

      if (!searchTerm) {
        throw new Error("searchTerm is required.");
      }

      const lowercaseSearchTerm = searchTerm.toLowerCase().trim();

      // 스캔 시작
      let scan = this.productViewModel.scan();

      // GSI_KEY를 사용하여 스캔 범위를 제한
      scan = scan.where('GSI_KEY').eq('PRODUCT');

      // 적절한 인덱스 선택
      switch (sortBy) {
        case 'discountRate':
          scan = scan.using('DiscountRateIndex');
          break;
        case 'distance':
          scan = scan.using('DistanceIndex');
          break;
        case 'distanceDiscountScore':
          scan = scan.using('DistanceDiscountIndex');
          break;
        default:
          scan = scan.using('ProductNameIndex');
      }

      // Scan 연산에 limit 적용
      scan = scan.limit(1000);  // 적절한 값으로 조정하세요.

      if (exclusiveStartKey) {
        const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
        scan = scan.startAt(startKey);
      }

      const results: ScanResponse<ProductView> = await scan.exec();

      // 검색어로 필터링 및 정렬
      let filteredItems = (results as unknown as ProductView[]).filter(item =>
        item.name.toLowerCase().includes(lowercaseSearchTerm)
      );

      filteredItems.sort((a, b) => {
        if (order === 'asc') {
          return a[sortBy] - b[sortBy];
        } else {
          return b[sortBy] - a[sortBy];
        }
      });

      // 페이지네이션 적용
      const items = filteredItems.slice(0, Number(limit));

      const createMinimalKey = (item: ProductView | null) => {
        if (!item) return null;
        return {
          GSI_KEY: 'PRODUCT',
          productId: item.productId,
          [sortBy]: item[sortBy]
        };
      };

      let firstEvaluatedKey = createMinimalKey(items[0]);
      let lastEvaluatedKey = items.length === Number(limit) ? createMinimalKey(items[items.length - 1]) : null;

      const appUrl = this.configService.get<string>('APP_URL');
      const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
        if (!key || !appUrl) return null;
        const baseUrl = new URL("/api/products/search", appUrl);
        baseUrl.searchParams.append('searchTerm', searchTerm);
        baseUrl.searchParams.append('sortBy', sortBy);
        baseUrl.searchParams.append('order', order);
        baseUrl.searchParams.append('limit', limit.toString());
        baseUrl.searchParams.append('exclusiveStartKey', encodeURIComponent(JSON.stringify(key)));
        if (prevKey) {
          baseUrl.searchParams.append('previousPageKey', encodeURIComponent(prevKey));
        }
        return baseUrl.toString();
      };

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

    } catch (error) {
      console.error(`Search query failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to execute search query');
    }
  }

  private createPolygonFromCoordinates(latitude: number, longitude: number): Polygon {
    return {
      type: 'Polygon',
      coordinates: [[[longitude, latitude]]]
    };
  }
}

