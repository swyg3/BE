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
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "./commands/impl/create-product.command";
import { CreateProductDto } from "./dtos/create-product.dto";
import { DeleteProductCommand } from "./commands/impl/delete-product.command";
import { UpdateProductCommand } from "./commands/impl/update-product.command";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { GetCategoryDto } from "./dtos/get-category.dto";
import { DyGetProductByIdQuery } from "./queries/impl/dy-get-prouct-by-id.query";
import { DyGetProductByDiscountRateQuery } from "./queries/impl/dy-get-product-by-discountRate.query";
import { DyProductViewRepository } from "./repositories/dy-product-view.repository";
import { DyGetProductByDiscountRateInputDto } from "./dtos/dy-get-products-by-discountRate.dto";
import { GetCategoryQuery } from "./queries/impl/dy-get-product-by-category.query";


@ApiTags("Products")
@Controller("products")
@UseGuards(ThrottlerGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly dyProductViewRepository: DyProductViewRepository,
  ) { }

  @ApiOperation({ summary: "상품 등록" })
  @ApiResponse({ status: 201, description: "상품 생성 성공" })
  @ApiResponse({ status: 400, description: "상품 생성 실패" })
  @Post("create")
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
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const productImageUrl = file.filename;
    this.logger.log(`controller${productImageUrl}`);
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
  @Delete("delete/:id")
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
  @Get("get/:id")
  @UseGuards(JwtAuthGuard)
  async getProductById(@Param("id") id: string): Promise<CustomResponse> {
    const product = await this.queryBus.execute(new DyGetProductByIdQuery(id));

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
  @Patch("update/:id")
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
  @Get("discountrate")
  async getProducts(@Query() query: DyGetProductByDiscountRateInputDto) {
    console.log('Received query:', query);

    const productQuery = new DyGetProductByDiscountRateInputDto();
    productQuery.order = query.order;
    productQuery.limit = Number(query.limit);
    productQuery.exclusiveStartKey = query.exclusiveStartKey || '';
    productQuery.previousPageKey = query.previousPageKey || '';
    console.log('Processed query:', productQuery);

    const result = await this.queryBus.execute(
      new DyGetProductByDiscountRateQuery(productQuery)
    );

    return {
      success: true,
      message: '해당 상품리스트 조회를 성공했습니다.',
      data: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl,
      firstEvaluatedUrl: result.firstEvaluatedUrl,
      prevPageUrl:result.prevPageUrl,
      count: result.count
    };
  }


  // @Get("category")
  // async getCategoryProducts(@Query() query: GetProductByCategoryDto) {
  //   console.log('Received query:', query);
  //   const productQuery = new GetProductByCategoryDto();
  //   productQuery.where__id_more_than = query.where__id_more_than;
  //   productQuery.category = query.category as Category;
  //   productQuery.take = query.take||100;
  //   productQuery.order__discountRate = query.order__discountRate;

  //   console.log('Processed query:', productQuery);

  //   const product = await this.queryBus.execute(productQuery);
  //   return this.queryBus.execute(query);


  // }

  @ApiOperation({ summary: "상품 카테고리 조회" })
  @ApiResponse({ status: 200, description: "상품 카테고리 조회 성공" })
  @Get("category")
  async getCategory(@Query() query: GetCategoryDto) {
    console.log('Received query:', query);

    const productQuery = new GetCategoryQuery(query);

    console.log('Processed query:', productQuery);

    try {
      const product = await this.queryBus.execute(productQuery);

      return {
        success: true,
        message: product.items.length > 0
          ? "해당 상품리스트 조회를 성공했습니다."
          : "조건에 맞는 상품을 찾을 수 없습니다.",
        data: product,
      };
    } catch (error) {
      console.error('Error in getCategory:', error);
      throw error;
    }
  }





  // @Post('image')
  // @UseInterceptors(FileInterceptor('image'))
  // postImage(
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return {
  //     productImageUrl: file.filename,
  //   };
  // }


}
