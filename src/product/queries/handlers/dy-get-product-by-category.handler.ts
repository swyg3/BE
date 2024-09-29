import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { DyProductViewRepository } from "src/product/repositories/dy-product-view.repository";
import { Logger } from "@nestjs/common";
import { GetCategoryQueryOutputDto } from "src/product/dtos/get-category-out-dto";
import { GetCategoryQuery } from "../impl/dy-get-product-by-category.query";

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    private readonly dyProductViewRepository: DyProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: GetCategoryQuery): Promise<GetCategoryQueryOutputDto> {
    const { category, sortBy, order, limit, exclusiveStartKey } = query.dto;

    const param = {
      category,
      sortBy,
      order,
      limit: Number(limit) || 10,
      ...(exclusiveStartKey && { exclusiveStartKey }),
    };

    this.logger.log(`Executing query with parameters: ${JSON.stringify(param)}`);

    let result;
    if (sortBy === 'discountRate') {
      result = await this.dyProductViewRepository.findProductsByCategoryAndDiscountRate(param);
    } else {
        console.log("예외")
     // result = await this.dyProductViewRepository.findProductsByCategoryAndCreatedAt(param);
    }

    return {
      items: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl || null,
      firstEvaluatedUrl: result.firstEvaluatedUrl || null,
      prevPageUrl: result.prevPageUrl,
      count: result.count,
    };
  }
}
