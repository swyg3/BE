import { SortByOption } from "src/product/repositories/product-view.repository";

export class SearchProductsQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly sortBy: SortByOption,
    public readonly order: 'asc' | 'desc',
    public readonly limit: number,
    public readonly latitude:string,
    public readonly longitude:string,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string,
 
  ) {}
}
