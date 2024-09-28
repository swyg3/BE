import { Category } from "src/product/product.category";

export class GetCategoryQuery {
  constructor(
    public readonly category: Category,
    public readonly sortBy: 'discountRate' | 'createdAt',
    public readonly order: 'asc' | 'desc',
    public readonly limit?: number,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string,
  ) {}
}
