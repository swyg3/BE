import {
  Post,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Controller,
  Logger,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "./commands/impl/create-product.command";
import { CreateProductDto } from "./dtos/create-product.dto";
import { DeleteProductCommand } from "./commands/impl/delete-product.command";
import { GetProductByIdQuery } from "./queries/impl/get-product-by-id.query";
import { UpdateProductCommand } from "./commands/impl/update-product.command";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetProductByDiscountRateDto } from "./dtos/get-products-by-discountRate.dto";
import { ThrottlerGuard } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from 'express';
import { GetProductByCategoryDto } from "./dtos/get-product-by-category.dto";

@ApiTags("Products")
@Controller("products")
@UseGuards(ThrottlerGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({ summary: "상품 등록" })
  @ApiResponse({ status: 201, description: "상품 생성 성공" })
  @ApiResponse({ status: 400, description: "상품 생성 실패" })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CustomResponse> {
    const {
      sellerId,
      category,
      name,
      description,
      originalPrice,
      discountedPrice,
      quantity,
      expirationDate,
    } = createProductDto;

    // 필요 시 문자열을 Date 객체로 변환
    const expirationDateObj = new Date(expirationDate);
    this.logger.log(
      `Creating product with expiration date: ${expirationDateObj}`,
    );
    const productImageUrl = file.filename;

    const result = await this.commandBus.execute(
      new CreateProductCommand(
        sellerId,
        category,
        name,
        productImageUrl,
        description,
        originalPrice,
        discountedPrice,
        quantity,
        expirationDateObj,
      ),
    );

    return {
      success: !!result,
      message: result
        ? "상품 등록에 성공했습니다."
        : "상품 등록에 실패했습니다.",
    };
  }
  @ApiOperation({ summary: "상품 삭제" })
  @ApiResponse({ status: 200, description: "상품 삭제 성공" })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  @ApiResponse({ status: 400, description: "상품 삭제 실패" })
  @Delete(":id")
  async deleteProduct(@Param("id") id: string): Promise<CustomResponse> {
    const result = await this.commandBus.execute(new DeleteProductCommand(id));

    return {
      success: !!result,
      message: result
        ? "상품 삭제를 성공했습니다."
        : "상품 삭제를 실패했습니다.",
    };
  }

  @ApiOperation({ summary: "상품 상세 조회" })
  @ApiResponse({ status: 200, description: "상품 상세 조회 성공" })
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getProductById(@Param("id") id: string): Promise<CustomResponse> {
    const product = await this.queryBus.execute(new GetProductByIdQuery(id));

    return {
      success: !!product,
      message: product
        ? "해당 상품 상세 조회를 성공했습니다."
        : "상품을 찾을 수 없습니다.",
      data: product,
    };
  }

  @ApiOperation({ summary: "상품 수정" })
  @ApiResponse({ status: 200, description: "상품 수정 성공" })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  @ApiResponse({ status: 400, description: "상품 수정 실패" })
  @Patch(":id")
  async updateProduct(
    @Param("id") id: string,
    @Body()
    updateProductDto: {
      name?: string;
      productImageUrl?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
      quantity?: number;
      expirationDate?: string;
    },
  ): Promise<CustomResponse> {
    const expirationDateObj = updateProductDto.expirationDate
      ? new Date(updateProductDto.expirationDate)
      : undefined;
    this.logger.log(
      `Updating product with expiration date: ${expirationDateObj}`,
    );

    const command = new UpdateProductCommand(id, {
      ...updateProductDto,
      expirationDate: expirationDateObj,
    });

    const result = await this.commandBus.execute(command);

    return {
      success: !!result,
      message: result
        ? "상품 수정을 성공했습니다."
        : "상품 수정을 실패했습니다.",
      data: result,
    };
  }

  @ApiOperation({ summary: "상품 할인률 순 조회" })
  @ApiResponse({ status: 200, description: "상품 할인률 순 조회 성공" })
  @Get()
  async getProducts(@Query() query: GetProductByDiscountRateDto) {
    const productQuery = new GetProductByDiscountRateDto();
    productQuery.where__id_more_than = query.where__id_more_than;
    productQuery.order__discountRate = query.order__discountRate;
    productQuery.take = query.take||100;

    const product = await this.queryBus.execute(productQuery);

    return {
      success: !!product,
      message: product
        ? "해당 상품리스트 조회를 성공했습니다."
        : "상품을 찾을 수 없습니다.",
      data: product,
    };
  }

  @ApiOperation({ summary: "카테고리별 상품 조회" })
  @ApiResponse({ description: "카테고리별 상품 조회 성공"})
  @Get("category")
  async getCategoryProducts(@Query() query: GetProductByCategoryDto) {
    const productQuery = new GetProductByCategoryDto();
    productQuery.where__id_more_than = query.where__id_more_than;
    productQuery.category = query.category;  
    productQuery.order__discountRate = query.order__discountRate;
    productQuery.order__createdAt = query.order__createdAt;  
    productQuery.take = query.take;
    console.log(query);
  
    const product = await this.queryBus.execute(productQuery);
  
    return {
      success: !!product,
      message: product.data.length > 0
        ? "해당 상품리스트 조회를 성공했습니다."
        : "조건에 맞는 상품을 찾을 수 없습니다.",
      data: product,
    };
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  postImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      productImageUrl: file.filename,
    }
  }


}
