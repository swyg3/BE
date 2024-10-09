import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProductsByCategoryDto } from "src/product/dtos/get-category.dto";
import { ProductViewRepository, SortByOption } from "src/product/repositories/product-view.repository";
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
    const { category, sortBy, order, limit, latitude, longitude,exclusiveStartKey, previousPageKey } = query;

    const param = {
      category:category as Category,
      sortBy: sortBy as SortByOption,
      order,
      limit: Number(limit),
      latitude,
      longitude,
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(previousPageKey && { previousPageKey })
    };

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