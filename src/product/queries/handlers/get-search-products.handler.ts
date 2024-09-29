import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchProductsQuery } from '../impl/get-search-products';
import { ProductViewRepository } from 'src/product/repositories/product-view.repository';

@QueryHandler(SearchProductsQuery)
export class SearchProductsHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async execute(query: SearchProductsQuery): Promise<any> {
    const { 
      searchTerm, 
      sortBy = 'discountRate', 
      order = 'desc', 
      limit = 10, 
      exclusiveStartKey,
      previousPageKey 
    } = query;

    if (!searchTerm || searchTerm.trim() === '') {
      return {
        items: [],
        lastEvaluatedUrl: null,
        firstEvaluatedUrl: null,
        prevPageUrl: null,
        count: 0
      };
    }

    return this.productViewRepository.searchProducts({
      searchTerm,
      sortBy,
      order,
      limit,
      exclusiveStartKey,
      previousPageKey
    });
  }
}