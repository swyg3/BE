// import { Injectable, Logger } from "@nestjs/common";
// import { InjectModel, Model } from "nestjs-dynamoose";
// import { ProductView } from "../schemas/product-view.schema";
// export interface DySearchProductView {
//   productId: string;
//   name: string;
//   discountRate
//   discountedPrice
//   price
//   description: string;
//   expireDate
//   availableStock

// }
// // @Injectable()
// // export class DyProductViewSearchRepository {
// //   private readonly logger = new Logger(DyProductViewSearchRepository.name);

// //   constructor(
// //     @InjectModel("ProductView")
// //     private readonly dyProductViewModel: Model<DyProductView, { productId: string }>,
// //   ) {}

// //   async findProductsByName(name: string): Promise<DyProductView[]> {
// //     try {
// //       this.logger.log(`ProductView 이름으로 조회: name=${name}`);
// //       const results = await this.dyProductViewModel
// //         .query("name") 
// //         .contains(name)
// //         .exec();

// //         if (Array.isArray(results)) {
// //           return results as DyProductView[];
        
        
// //         return [];
// //     } catch (error) {
// //       this.logger.error(`ProductView 이름으로 조회 실패: ${error.message}`, error.stack);
// //       return [];
// //     }
// //   }
  
// // }
