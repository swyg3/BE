import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { DyProductViewRepository } from "src/product/repositories/dy-product-view.repository";
import { DyGetProductByDiscountRateQuery } from "../impl/dy-get-product-by-discountRate.query";
import { Logger } from "@nestjs/common";
import { DyGetProductByDiscountRateOutputDto } from "src/product/dtos/dy-get-product-by-dicounstRateout.dto";

@QueryHandler(DyGetProductByDiscountRateQuery)
export class DyGetProductByDiscountRateHandler 
  implements IQueryHandler<DyGetProductByDiscountRateQuery> {
  constructor(
    private readonly dyProductViewRepository: DyProductViewRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: DyGetProductByDiscountRateQuery): Promise<DyGetProductByDiscountRateOutputDto> {
    const { order, limit, exclusiveStartKey, paginationDirection } = query.dto;
    
    const param = {
      order,
      limit: Number(limit),
      ...(exclusiveStartKey && { exclusiveStartKey }),
      ...(paginationDirection && { paginationDirection }),
    };

    this.logger.log(`Executing query with parameters: ${JSON.stringify(param)}`);

    const result = await this.dyProductViewRepository.findProductsByDiscountRate(param);

    this.logger.log(`Query result: ${result.count} items found`);

    return {
      items: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl || null,
      firstEvaluatedUrl: result.firstEvaluatedUrl || null,
      count: result.count,
    };
  }
}