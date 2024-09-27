import { GetCategoryDto } from "src/product/dtos/get-category.dto";

export class GetCategoryQuery {
    constructor(public readonly dto: GetCategoryDto ) {}
  }