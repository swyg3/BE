import { IQuery } from '@nestjs/cqrs';

export class SearchProductsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly sortBy: 'discountRate' | 'createdAt' = 'discountRate',
    public readonly order: 'asc' | 'desc' = 'desc',
    public readonly limit: number = 10,
    public readonly exclusiveStartKey?: string,
    public readonly previousPageKey?: string
  ) {}
}