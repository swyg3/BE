
import { Controller, Post, Body, Delete, Get, Param, Put, Patch } from '@nestjs/common';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { CreateProductDto } from './dtos/create-product.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { DeleteProductCommand } from './commands/impl/delete-product.command';
import { GetProductByIdQuery } from './queries/impl/get-product-by-id.query';
import { UpdateProductCommand } from './commands/impl/update-product.command';

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

  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: {
      name: string;
      productImageUrl?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
    }
  ) {
    const command = new UpdateProductCommand(
      id,
      updateProductDto 
    );
  

    return this.commandBus.execute(command);
  }
}
  

