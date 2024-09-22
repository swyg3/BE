import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { ProductView } from "../schemas/product-view.schema";
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
}
@Injectable()
export class DyProductViewSearchRepository {
  private readonly logger = new Logger(DyProductViewSearchRepository.name);

  constructor(
    @InjectModel("ProductView")
    private readonly dyProductViewModel: Model<DyProductView, { productId: string }>,
  ) {}

  async findProductsByName(name: string): Promise<DyProductView[]> {
    try {
      this.logger.log(`ProductView 이름으로 조회: name=${name}`);
      const results = await this.dyProductViewModel
        .query("name") // 'name' 필드로 쿼리
        .contains(name)
        .exec();

        if (Array.isArray(results)) {
          return results as DyProductView[]; // 적절한 타입으로 반환
        }
        
        // results가 배열이 아닐 경우 처리
        return [];
    } catch (error) {
      this.logger.error(`ProductView 이름으로 조회 실패: ${error.message}`, error.stack);
      return [];
    }
  }
  
}
