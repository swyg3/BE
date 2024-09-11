import { Controller, Post, Body, Delete, Get, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { CreateProductDto } from './dtos/create-product.dto';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { DeleteProductCommand } from './commands/impl/delete-product.command';
import { GetProductByIdQuery } from './queries/impl/get-product-by-id.query';
import { UpdateProductCommand } from './commands/impl/update-product.command';

@Controller('api/products')
export class ProductController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const { sellerId, category, name, productImageUrl, description, originalPrice, discountedPrice, quantity, expirationDate } = createProductDto;


    if (expirationDate) {
      
      // 기본 시간 00:00:00을 추가
      const formattedDate = `${expirationDate}T00:00:00Z`;
      const expirationDateObj = new Date(formattedDate);
      
      console.log('expirationDateObj:', expirationDateObj);
      console.log('expirationDate:', formattedDate);
  

    await this.commandBus.execute(new CreateProductCommand(
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
      quantity,
      expirationDateObj
    ));
  } else {
    console.log('No expiration date provided');
  }

    return { name, success: true }; // boolean 타입 대신 true로 설정
  }

  @Delete(':id')
  async deleteProduct(@Body() deleteProductDto: DeleteProductDto) {
    const { Id } = deleteProductDto;
    await this.commandBus.execute(new DeleteProductCommand(Id));
    return { Id, success: true }; // boolean 타입 대신 true로 설정
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
    const command = new UpdateProductCommand(id, updateProductDto);
    return this.commandBus.execute(command);
  }
}
