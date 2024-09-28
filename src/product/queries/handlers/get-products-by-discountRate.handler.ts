import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";
import { GetProductByDiscountRateQuery } from "../impl/get-product-by-discountRate.query";
import { Logger } from "@nestjs/common";
import { GetProductByDiscountRateOutputDto } from "src/product/dtos/get-dicounstRate-out.dto";

@QueryHandler(GetProductByDiscountRateQuery)
export class GetProductByDiscountRateHandler 
  implements IQueryHandler<GetProductByDiscountRateQuery> {
  constructor(
    private readonly dyProductViewRepository: ProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: GetProductByDiscountRateQuery): Promise<GetProductByDiscountRateOutputDto> {
    const { order, limit, exclusiveStartKey, previousPageKey } = query;
    
    const param = {
      order,
      limit: Number(limit),
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(previousPageKey &&{previousPageKey})
    };

    this.logger.log(`Executing query with parameters: ${JSON.stringify(param)}`);

    const result = await this.dyProductViewRepository.findProductsByDiscountRate(param);

    this.logger.log(`Query result: ${result.count} items found`);

    return {
      items: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl || null,
      firstEvaluatedUrl: result.firstEvaluatedUrl || null,
      prevPageUrl:result.prevPageUrl||null,
      count: result.count,
    };
  }
}