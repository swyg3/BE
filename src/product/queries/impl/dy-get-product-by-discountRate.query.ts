import { DyGetProductByDiscountRateInputDto  } from "src/product/dtos/dy-get-products-by-discountRate.dto";

export class DyGetProductByDiscountRateQuery {
    constructor(public readonly dto: DyGetProductByDiscountRateInputDto ) {}
  }