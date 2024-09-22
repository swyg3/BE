import { Controller, Get, Query } from '@nestjs/common';
import { CustomResponse } from 'src/shared/interfaces/api-response.interface';
import { QueryBus } from '@nestjs/cqrs';
import { FindProductsByName } from './queries/impl/dy-product-search.query';

@Controller('products')
export class ProductSearchController {
  constructor(
    private readonly queryBus: QueryBus,

  ) {}
  @Get('search')
  async search(@Query('name') name: string): Promise<CustomResponse> {
    const products = await this.queryBus.execute(new FindProductsByName(name));
    return {
        success: true,
        data: products,
      };
  }
}
