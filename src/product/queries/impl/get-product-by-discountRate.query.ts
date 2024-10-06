export class GetProductByDiscountRateQuery {
  constructor(
    public readonly order: 'asc' | 'desc',
    public readonly limit: number,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string,
  ) {}
}
