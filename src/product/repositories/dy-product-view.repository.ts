import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";

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
  ) {}

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

  // 할인율 기준 상품 목록 조회
  async findProductsByDiscountRate({
    order,
    limit,
    cursor,
    minDiscountRate,
    maxDiscountRate,
  }: {
    order: "asc" | "desc";
    limit: number;
    cursor?: string;
    minDiscountRate?: number;
    maxDiscountRate?: number;
  }): Promise<{ items: DyProductView[]; lastEvaluatedKey: string | null }> {
    try {
      this.logger.log(
        `할인율별 ProductView 조회: ${JSON.stringify({ order, limit, cursor, minDiscountRate, maxDiscountRate })}`,
      );

      let query = this.dyProductViewModel.query("discountRate");

      if (minDiscountRate !== undefined && maxDiscountRate !== undefined) {
        query = query.between(minDiscountRate, maxDiscountRate);
      } else if (minDiscountRate !== undefined) {
        query = query.ge(minDiscountRate);
      } else if (maxDiscountRate !== undefined) {
        query = query.le(maxDiscountRate);
      }

      query = query.using("DiscountRateIndex");

      const sortOrder: SortOrder =
        order === "asc" ? SortOrder.ascending : SortOrder.descending;
      query = query.sort(sortOrder);

      query = query.limit(limit);

      if (cursor) {
        query = query.startAt({ productId: cursor });
      }

      const results = await query.exec();

      return {
        items: results,
        lastEvaluatedKey: results.lastKey ? results.lastKey.productId : null,
      };
    } catch (error) {
      this.logger.error(
        `할인율별 ProductView 조회 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
