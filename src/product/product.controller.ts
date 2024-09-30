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
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { GetProductByDiscountRateInputDto } from "./dtos/get-discountRate.dto";
import { GetProductByIdQuery } from "./queries/impl/get-prouct-by-id.query";
import { GetProductByDiscountRateQuery } from "./queries/impl/get-product-by-discountRate.query";
import { GetNearestProductsQuery } from "./queries/impl/get-nearest-products";
import { FindProductsByCategoryDto } from "./dtos/get-category.dto";
import { SearchProductsDto } from "./dtos/get-search.dto";
import { FindProductsByCategoryQuery } from "./queries/impl/get-product-by-category.query";
import { SearchProductsQuery } from "./queries/impl/get-search-products";


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
  @ApiParam({ name: "id", description: "조회할 상품의 ID" })
  @Get("get/:id")
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
  @UseGuards(JwtAuthGuard)
  async getProductsByDiscountRate(
    @Query() queryDto: GetProductByDiscountRateInputDto,
  ) {
    const { order, limit, exclusiveStartKey, previousPageKey } = queryDto;
    const query = new GetProductByDiscountRateQuery(order, limit, exclusiveStartKey, previousPageKey);
    const result = await this.queryBus.execute(query);

    return {
      success: true,
      message: '해당 상품리스트 조회를 성공했습니다.',
      data: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl,
      firstEvaluatedUrl: result.firstEvaluatedUrl,
      prevPageUrl: result.prevPageUrl,
      count: result.count
    };
  }

  @Get('category')
  @ApiOperation({ summary: '카테고리별 제품 조회', description: '지정된 카테고리의 제품을 조회하고 정렬합니다.' })
  @ApiResponse({ status: 200, description: '성공적으로 제품 목록을 반환함', type: [Object] })
  async findProductsByCategoryAndSort(@Query() findProductsByCategoryDto: FindProductsByCategoryDto) {
    const {category, sortBy, order, limit, exclusiveStartKey, previousPageKey } = findProductsByCategoryDto;
    const query = new FindProductsByCategoryQuery(category, sortBy, order, limit, exclusiveStartKey, previousPageKey);
    return this.queryBus.execute(query);
  }
 

  @Get('search')
  @ApiOperation({ summary: '제품 검색', description: '검색어를 기반으로 제품을 검색하고 정렬합니다.' })
  @ApiResponse({ status: 200, description: '성공적으로 검색 결과를 반환함', type: [Object] })
  async searchProducts(@Query() searchProductsDto: SearchProductsDto) {
    const {searchTerm, sortBy, order, limit, exclusiveStartKey, previousPageKey } = searchProductsDto;
    const query = new SearchProductsQuery(searchTerm, sortBy, order, limit, exclusiveStartKey, previousPageKey);
    return this.queryBus.execute(query);
  }


  //위치허용 api
  @Get('nearest')
  @ApiOperation({ summary: '가까운 상품 조회', description: '사용자 위치 기반으로 가까운 상품을 조회합니다.' })
  @ApiResponse({ status: 200, description: '가까운 상품 조회 성공' })
  @ApiQuery({ name: 'lat', type: Number, description: '위도' })
  @ApiQuery({ name: 'lon', type: Number, description: '경도' })
  @UseGuards(JwtAuthGuard)
  async getNearestProducts(@Query('lat') lat: number, @Query('lon') lon: number): Promise<any[]> {
    const query = new GetNearestProductsQuery(lat, lon);
    return this.queryBus.execute(query);
  }



}
