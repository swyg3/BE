import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model, QueryResponse } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";
import { DySearchProductView, DySearchProductViewModel } from "../schemas/dy-product-search-view.schema";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuidv4 } from 'uuid';

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


  
  async findProductsByDiscountRate(
    param: {
      order: 'asc' | 'desc';
      limit: number;
      exclusiveStartKey?: string;
    }
  ): Promise<{
    items: DyProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    count: number
  }> {
    try {
      const sortOrder = param.order === 'desc' ? SortOrder.descending : SortOrder.ascending;
      let startKey: Record<string, any> | undefined;
  
      if (param.exclusiveStartKey) {
        startKey = JSON.parse(param.exclusiveStartKey);
      }
  
      // GSI를 사용한 쿼리 시작
      let query = this.dyProductViewModel
        .query('GSI_KEY')
        .eq('PRODUCT')
        .using('DiscountRateIndex');
  
      // discountRate에 대한 조건 추가
      if (startKey && startKey.discountRate !== undefined) {
        if (sortOrder === SortOrder.ascending) {
          query = query.where('discountRate').ge(startKey.discountRate);
        } else {
          query = query.where('discountRate').le(startKey.discountRate);
        }
      }
  
      query = query.sort(sortOrder).limit(Number(2));
  
      // 쿼리 실행
      const results: QueryResponse<DyProductView> = await query.exec();
      
      const items = Array.from(results);  // QueryResponse를 배열로 변환
  
      this.logger.log(`Pagination query result: ${items.length} items`);
  
      // 첫 번째 평가된 키 설정
      const firstEvaluatedKey = items.length > 0 ? {
        productId: items[0].productId,
        GSI_KEY: 'PRODUCT',
        discountRate: items[0].discountRate,
      } : null;
  
      // 마지막 평가된 키 설정
      const lastEvaluatedKey = results.lastKey || null;
  
      // URL 생성 (페이지네이션용)
      const appUrl = this.configService.get<string>('APP_URL');
      const createUrlWithKey = (key: Record<string, any> | null) => {
        if (!key || !appUrl) return null;
        const baseUrl = new URL("/api/products/discountrate", appUrl);
        baseUrl.searchParams.append('order', param.order);
        baseUrl.searchParams.append('limit', param.limit.toString());
        baseUrl.searchParams.append('exclusiveStartKey', JSON.stringify(key));
        return baseUrl.toString();
      };
  
      // 첫 번째 및 마지막 평가된 키에 URL 추가
      const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey);
      const lastEvaluatedUrl = createUrlWithKey(lastEvaluatedKey);
  
      return {
        items,
        lastEvaluatedUrl,
        firstEvaluatedUrl,
        count: items.length
      };
    } catch (error) {
      this.logger.error(`Pagination query failed: ${error.message}`, error.stack);
      throw error;
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
