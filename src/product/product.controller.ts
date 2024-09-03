
import { Controller, Post, Body } from '@nestjs/common';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { CreateProductDto } from './dtos/create-product.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@Controller('products')
export class ProductController {
  constructor(private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) { }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const { sellerId, category, name, productImageUrl, description, originalPrice, discountedPrice } = createProductDto;

    await this.commandBus.execute(new CreateProductCommand(
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    ));

    return { sellerId, message: 'Product created successfully' };
  }
}
