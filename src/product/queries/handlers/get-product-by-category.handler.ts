import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";
import { Logger } from "@nestjs/common";
import { GetCategoryQueryOutputDto } from "src/product/dtos/get-category-out-dto";
import { GetCategoryQuery } from "../impl/get-product-by-category.query";

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: GetCategoryQuery): Promise<GetCategoryQueryOutputDto> {
    const { category, sortBy, order, limit, exclusiveStartKey,
      previousPageKey
     } = query.dto;

    const param = {
      category,
      sortBy,
      order,
      limit: Number(limit) || 10,
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(previousPageKey && { previousPageKey }),
    };

    this.logger.log(`Executing query with parameters: ${JSON.stringify(param)}`);

    let result;
    if (sortBy === 'discountRate') {
      result = await this.productViewRepository.findProductsByCategoryAndDiscountRate(param);
    } else {
        console.log("아직 개발못한 지오코딩")
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
