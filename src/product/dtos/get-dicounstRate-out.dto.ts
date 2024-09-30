import { ProductView } from "../repositories/product-view.repository";

export class GetProductByDiscountRateOutputDto {
    items: ProductView[];
    lastEvaluatedUrl: string | undefined;
    firstEvaluatedUrl: string | undefined;
    prevPageUrl:string | undefined;
    count: number;
  }
  