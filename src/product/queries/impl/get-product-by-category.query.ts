import { SortByOption } from "src/product/dtos/get-category.dto";
import { Category } from "src/product/product.category";

export class FindProductsByCategoryQuery {
  constructor(
    public readonly category: Category,
    public readonly sortBy: SortByOption,
    public readonly order: 'asc' | 'desc',
    public readonly limit: number,
    public readonly latitude: string,
    public readonly longitude: string,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string,
  ) {}
}