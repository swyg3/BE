import { GetProductByDiscountRateInputDto } from "src/product/dtos/get-discountRate.dto";

export class GetProductByDiscountRateQuery {
    constructor(public readonly dto: GetProductByDiscountRateInputDto ) {}
  }