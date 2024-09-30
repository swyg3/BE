import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProductsByCategoryDto } from "src/product/dtos/get-category.dto";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";
import { Logger } from "@nestjs/common";
import { FindProductsByCategoryQuery } from "../impl/get-product-by-category.query";
import { GetProductByDiscountRateOutputDto } from "src/product/dtos/get-dicounstRate-out.dto";
import { Category } from "src/product/product.category";


@QueryHandler(FindProductsByCategoryQuery)
export class FindProductsByCategoryHandler implements IQueryHandler<FindProductsByCategoryQuery> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: FindProductsByCategoryQuery): Promise<GetProductByDiscountRateOutputDto>{
    const { category, sortBy, order, limit, exclusiveStartKey, previousPageKey } = query;

    const param = {
      category:category as Category,
      sortBy:sortBy as "discountRate" | "distance" | "distanceDiscountScore",
      order,
      limit: Number(limit),
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(previousPageKey && { previousPageKey })
    };

    this.logger.log(`Executing find products by category query with parameters: ${JSON.stringify(param)}`);

    const result = await this.productViewRepository.findProductsByCategoryAndSort(param);

    this.logger.log(`Query result: ${result.count} items found`);

    return {
      items: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl || null,
      firstEvaluatedUrl: result.firstEvaluatedUrl || null,
      prevPageUrl: result.prevPageUrl || null,
      count: result.count,
    };
  }
}