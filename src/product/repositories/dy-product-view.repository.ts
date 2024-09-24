import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";
import { DySearchProductView, DySearchProductViewModel } from "../schemas/dy-product-search-view.schema";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { Item } from 'dynamoose/dist/Item';

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
  async findAllProductsByCategory(category: string): Promise<DyProductView[]> {
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
  ): Promise<{ items: DyProductView[]; lastEvaluatedUrl: string | null; firstEvaluatedUrl: string | null; count: number }> {
    try {
      
      // GSI를 사용한 쿼리 시작
      let scan = this.dyProductViewModel
        .scan()
        .using("DiscountRateIndex")
        .filter("discountRate").gt(0);  // discountRate > 0 조건을 필터로 변경
      

      // 결과 제한
      scan = scan.limit(param.limit);

      // 시작 키 설정 (페이지네이션)
      if (param.exclusiveStartKey) {
        const startkey = param.exclusiveStartKey;
        scan = scan.startAt({ productId: startkey });
      }
      console.log(scan);

      // 쿼리 실행
      let results = await scan.exec();
      this.logger.log(`Pagination query result: ${results .length} items`);



      // 결과를 메모리에서 정렬 (수정된 부분)
      results = results.sort((a, b) => {
        if (param.order === 'asc') {
          return a.discountRate - b.discountRate;
        } else {
          return b.discountRate - a.discountRate;  // desc 순서를 위해 b - a로 변경
        }
      });

      let lastEvaluatedKey = results.lastKey?.productId || null;

      // 첫 번째 평가된 키 설정
      let firstEvaluatedKey = results[0]?.productId || null;
      const appUrl = this.configService.get<string>('APP_URL'); // APP_URL 가져오기
      // URL 생성 함수
      const createUrlWithKey = (key: string | null): string | null => {
        if (!key || !appUrl) return null;
        const baseUrl = new URL("/api/products/discountrate", appUrl);
        baseUrl.searchParams.append('order', param.order);
        baseUrl.searchParams.append('limit', param.limit.toString());
        baseUrl.searchParams.append('exclusiveStartKey', key);  // 여기서 key를 추가
        return baseUrl.toString();


      };
      // 첫 번째 및 마지막 평가된 키에 URL 추가
      const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey);
      const lastEvaluatedUrl = createUrlWithKey(lastEvaluatedKey);
      return {
        items: results,
        lastEvaluatedUrl,
        firstEvaluatedUrl,
        count: results.length
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
