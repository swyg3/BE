
import { Controller, Post, Body, Delete } from '@nestjs/common';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { CreateProductDto } from './dtos/create-product.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { DeleteProductCommand } from './commands/impl/delete-product.command';

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
  }

  @Delete()
  async deleteProduct(@Body() deleteProductDto: DeleteProductDto) {
    
    const { Id } = deleteProductDto;

    await this.commandBus.execute(new DeleteProductCommand(Id));


    return { Id, message: 'Product deleted successfully' };
  }
  
}
