export class SearchProductsQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly sortBy: string,
    public readonly order: 'asc' | 'desc',
    public readonly limit: number,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string,
  ) {}
}
