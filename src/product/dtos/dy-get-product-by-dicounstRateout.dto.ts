import { DyProductView } from "../repositories/dy-product-view.repository";

export class DyGetProductByDiscountRateOutputDto {
    items: DyProductView[];
    lastEvaluatedUrl: string | undefined;
    firstEvaluatedUrl: string | undefined;
    count: number;
  }
  