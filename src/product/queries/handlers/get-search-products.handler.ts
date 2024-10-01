import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchProductsQuery } from "../impl/get-search-products";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";
import { SearchProductsOutputDto } from "src/product/dtos/get-search-out.dto";
import { Logger } from "@nestjs/common";

@QueryHandler(SearchProductsQuery)
export class SearchProductsHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: SearchProductsQuery): Promise<SearchProductsOutputDto> {
    const { searchTerm, sortBy, order, limit, latitude,
      longitude,exclusiveStartKey, previousPageKey  } = query;

    const param = {
      searchTerm,
      sortBy:sortBy as "discountRate" | "distance" | "distanceDiscountScore",
      order,
      limit: Number(limit),
      latitude,
      longitude,
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(previousPageKey && { previousPageKey })
    };

    this.logger.log(`Executing search query with parameters: ${JSON.stringify(param)}`);

    const result = await this.productViewRepository.searchProducts(param);

    this.logger.log(`Search query result: ${result.count} items found`);

    return {
      items: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl || null,
      firstEvaluatedUrl: result.firstEvaluatedUrl || null,
      prevPageUrl: result.prevPageUrl || null,
      count: result.count,
    };
  }
}