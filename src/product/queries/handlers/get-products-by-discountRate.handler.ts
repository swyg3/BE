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
    const { order, take, exclusiveStartKey } = query.dto;
    const param = {
      order,
      limit: Number(take),
      ...(exclusiveStartKey && { exclusiveStartKey }),
    };

    const result = await this.dyProductViewRepository.findProductsByDiscountRate(param);
    return {
      items: result.items,
      lastEvaluatedKey: result.lastEvaluatedUrl ||null,
      firstEvaluatedKey:result.firstEvaluatedUrl||null,
      count: result.count,

    };
  }
}
