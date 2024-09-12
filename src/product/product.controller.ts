import { Controller, Post, Body, Delete, Get, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './commands/impl/create-product.command';
import { CreateProductDto } from './dtos/create-product.dto';
import { DeleteProductCommand } from './commands/impl/delete-product.command';
import { GetProductByIdQuery } from './queries/impl/get-product-by-id.query';
import { UpdateProductCommand } from './commands/impl/update-product.command';

@Controller('api/products')
export class ProductController {
  constructor(private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,) { }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const { sellerId, category, name, productImageUrl, description, originalPrice, discountedPrice, quantity, expirationDate } = createProductDto;


    if (expirationDate) {

      // 기본 시간 00:00:00을 추가
      const formattedDate = `${expirationDate}T00:00:00Z`;
      const expirationDateObj = new Date(formattedDate);


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

    return { name, success: true };
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const numberId = Number(id);
    if (isNaN(numberId)) {
      throw new Error('Invalid ID');
    }
    await this.commandBus.execute(new DeleteProductCommand(numberId));
    return { id, success: true };
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const numberId = Number(id);
    if (isNaN(numberId)) {
      throw new Error('Invalid ID');
    } return this.queryBus.execute(new GetProductByIdQuery(numberId));
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: {
      name?: string;
      productImageUrl?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
      quantity?: number;
      expirationDate?: string; // 수정된 부분
    }
  ) {
    const numberId = Number(id);
    if (isNaN(numberId)) {
      throw new Error('Invalid ID');
    }

    // expirationDate를 처리하는 부분
    let expirationDateObj: Date | undefined;
    if (updateProductDto.expirationDate) {
      const formattedDate = `${updateProductDto.expirationDate}T00:00:00Z`;
      expirationDateObj = new Date(formattedDate);

    }

    const command = new UpdateProductCommand(numberId, {
      ...updateProductDto,
      expirationDate: expirationDateObj
    });
    this.commandBus.execute(command);

    const productView = await this.commandBus.execute(command);
    return productView;
  }
}


