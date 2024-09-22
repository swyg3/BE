import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindProductsByName } from '../impl/dy-product-search.query';
import { DyProductViewSearchRepository } from 'src/product/repositories/dy-product-search.repository';

@QueryHandler(FindProductsByName)
export class FindProductsByNameHandler implements IQueryHandler<FindProductsByName> {
  constructor(private readonly repository: DyProductViewSearchRepository) {}

  async execute(query: FindProductsByName) {
    const { name } = query;
    return await this.repository.findProductsByName(name); // 이 메서드는 repository에서 구현 필요
  }
}
