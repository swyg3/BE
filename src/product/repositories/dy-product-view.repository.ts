import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model, QueryResponse } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";
import { DySearchProductView, DySearchProductViewModel } from "../schemas/dy-product-search-view.schema";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuidv4 } from 'uuid';
import { Category } from "../product.category";

export interface DyProductView {
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
}

@Injectable()
export class DyProductViewRepository {
  private readonly logger = new Logger(DyProductViewRepository.name);

  constructor(
    @InjectModel("DyProductView")
    private readonly dyProductViewModel: Model<
      DyProductView,
      { productId: string }
    >,
    private readonly configService: ConfigService
  ) { }

  // 상품 생성
  async create(productView: DyProductView): Promise<DyProductView> {
    try {
      this.logger.log(`ProductView 생성: ${productView.productId}`);
      this.logger.log(`Attempting to create ProductView: ${JSON.stringify(productView)}`);
      return await this.dyProductViewModel.create(productView);
    } catch (error) {
      this.logger.error(`ProductView 생성 실패: ${error.message}`, error.stack);
      this.logger.error(`Failed to create ProductView: ${JSON.stringify(productView)}`, error.stack);

      throw error;
    }
  }

  // 상품 수정
  async update(
    productId: string,
    updates: Partial<DyProductView>,
  ): Promise<DyProductView | null> {
    try {
      this.logger.log(`ProductView 업데이트: productId=${productId}`);
      const updatedProduct = await this.dyProductViewModel.update(
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
      await this.dyProductViewModel.delete({ productId });
    } catch (error) {
      this.logger.error(`ProductView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 상품ID로 단건 조회
  async findByProductId(productId: string): Promise<DyProductView | null> {
    try {
      this.logger.log(`ProductView 조회: productId=${productId}`);
      return await this.dyProductViewModel.get({ productId });
    } catch (error) {
      this.logger.error(`ProductView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  // 판매자ID로 상품 목록 조회
  async findAllProductsBySellerId(sellerId: string): Promise<DyProductView[]> {
    try {
      this.logger.log(`ProductView 조회: sellerId=${sellerId}`);
      const results = await this.dyProductViewModel
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
  async findProductsByCategory(category: string): Promise<DyProductView[]> {
    try {
      this.logger.log(`ProductView 조회: category=${category}`);
      const results = await this.dyProductViewModel
        .query("category")
        .eq(category)
        .exec();
      return results;
    } catch (error) {
      this.logger.error(`ProductView 조회 실패: ${error.message}`, error.stack);
      return [];
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
    items: DyProductView[];
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

      let query = this.dyProductViewModel
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

      const results: QueryResponse<DyProductView> = await query.exec();
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

  async findProductsByCategoryAndDiscountRate(param: {
    category: Category;
    order: 'asc' | 'desc';
    limit: number;
    exclusiveStartKey?: string;
    previousPageKey?: string;
  }): Promise<{
    items: DyProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number
  }> {
    try {
      const { category, order, limit, exclusiveStartKey, previousPageKey } = param;
      const sortOrder = order === 'desc' ? SortOrder.descending : SortOrder.ascending;
      let startKey: Record<string, any> | undefined;
  
      if (exclusiveStartKey) {
        startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
      }
  
      const queryLimit = Number(limit) + 1;
  
      let query = this.dyProductViewModel
        .query('category').eq(category)
        .using('CategoryDiscountRateIndex')
        .sort(sortOrder)
        .limit(queryLimit);
  
      if (startKey && startKey.discountRate !== undefined && startKey.category === category) {
        if (sortOrder === SortOrder.ascending) {
          query = query.where('discountRate').ge(startKey.discountRate);
        } else {
          query = query.where('discountRate').le(startKey.discountRate);
        }
      }
  
      console.log('Query object:', JSON.stringify(query.getRequest(), null, 2));
  
      const results: QueryResponse<DyProductView> = await query.exec();
      console.log('Query results:', JSON.stringify(results, null, 2));
  
      const items = Array.from(results).slice(0, limit);
  
      const createMinimalKey = (item: any) => {
        if (!item) return null;
        return {
          productId: item.productId,
          GSI_KEY: 'PRODUCT',
          category: item.category,
          discountRate: item.discountRate,
        };
      };
  
      let firstEvaluatedKey = createMinimalKey(items[0]);
      let lastEvaluatedKey = results.length > limit ? createMinimalKey(results[limit]) : null;
  
      const appUrl = this.configService.get<string>('APP_URL');
      const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
        if (!key || !appUrl) return null;
        const baseUrl = new URL(`/api/products/category`, appUrl);
        baseUrl.searchParams.append('category', category);
        baseUrl.searchParams.append('sortBy', 'discountRate');
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
      console.error(`Query failed: ${error.message}`, error.stack);
      console.error(`Query parameters:`, param);
      throw new InternalServerErrorException('Failed to execute query');
    }
  }
  async scanProducts(limit: number = 10): Promise<DyProductView[]> {
    try {
      const order: 'desc' | 'asc' = 'desc';
      let query = this.dyProductViewModel.query('discountRate')
        .using('DiscountRateIndex')
      query = query.sort(order === 'desc' ? SortOrder.ascending : SortOrder.descending);
      const results = await query.limit(limit).exec();

      this.logger.log(`스캔 결과: ${results.length} 항목`);
      return results;
    } catch (error) {
      this.logger.error(`스캔 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

}
