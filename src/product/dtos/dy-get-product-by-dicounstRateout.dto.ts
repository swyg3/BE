import { DyProductView } from "../repositories/dy-product-view.repository";

export class DyGetProductByDiscountRateOutputDto {
    items: DyProductView[];
    lastEvaluatedKey: string | undefined;
    count: number;
  }
  