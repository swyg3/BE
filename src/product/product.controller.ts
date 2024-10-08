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
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "./commands/impl/create-product.command";
import { CreateProductDto } from "./dtos/create-product.dto";
import { DeleteProductCommand } from "./commands/impl/delete-product.command";
import { UpdateProductCommand } from "./commands/impl/update-product.command";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
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
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { LocationViewRepository } from "src/location/location-view.repository";
import { Category } from "./product.category";
import { SortByOption } from "./repositories/product-view.repository";
import { ProductService, FindProductsParams, ProductQueryResult } from './product.service';


@ApiTags("Products")
@Controller("products")
@UseGuards(ThrottlerGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly locationViewRepository: LocationViewRepository,
    private readonly productService: ProductService,

  ) { }



  @ApiOperation({ summary: "상품 등록" })
  @ApiResponse({ status: 201, description: "상품 생성 성공" })
  @ApiResponse({ status: 400, description: "상품 생성 실패" })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sellerId: { type: 'string', example: 'uuid로 발행된 sellerID' },
        category: { type: 'string', example: 'KOREAN' },
        name: { type: 'string', example: '딸기 타르트' },
        description: { type: 'string', example: '맛있어요' },
        originalPrice: { type: 'number', example: 1000000 },
        discountedPrice: { type: 'number', example: 900000 },
        quantity: { type: 'number', example: 50 },
        expirationDate: { type: 'string', format: 'date-time', example: '2024-12-31T23:59:59Z' },
        image: {
          type: 'string',
          format: 'binary',
          description: '상품 이미지 파일 (JPG, PNG 형식 지원)'
        }
      },
      required: ['sellerId', 'category', 'name', 'description', 'originalPrice', 'discountedPrice', 'quantity', 'expirationDate', 'image']
    }
  })
  @Post("create")
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CreateProductResponse> {
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
      success: true,
      message: "상품 등록에 성공했습니다.",
      id: result.id,
    };
  } catch (error) {
    this.logger.error(`Failed to create product: ${error.message}`);
    return {
      success: false,
      message: "상품 등록에 실패했습니다.",
      id: null,
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '카테고리별 제품 조회', description: '지정된 카테고리의 제품을 조회하고 정렬합니다.' })
  @ApiResponse({ status: 200, description: '성공적으로 제품 목록을 반환함', type: [Object] })
  async findProductsByCategoryAndSort(
    @GetUser() user: JwtPayload,
    @Query() findProductsByCategoryDto: FindProductsByCategoryDto,
  ) {
    const { category, sortBy, order, limit, exclusiveStartKey, previousPageKey } = findProductsByCategoryDto;

    const currentLocation = await this.locationViewRepository.findCurrentLocation(user.userId);
    if (!currentLocation) {
      throw new NotFoundException('현재 위치 정보가 설정되어 있지 않습니다.');
    }
    const { latitude, longitude } = currentLocation;

    // Category enum으로 변환
    const categoryEnum = Category[category as keyof typeof Category];
    if (!categoryEnum) {
      throw new NotFoundException('유효하지 않은 카테고리입니다.');
    }
// SortByOption enum으로 변환
const sortByEnum = SortByOption[sortBy as keyof typeof SortByOption];
if (!sortByEnum) {
  throw new NotFoundException('유효하지 않은 정렬 옵션입니다.');
}
    const result = await this.productService.findProductsByCategoryAndSort({
      category: categoryEnum,
      sortBy:sortByEnum,
      order,
      limit,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      exclusiveStartKey,
      previousPageKey,
    });

    return {
      success: true,
      message: '해당 상품 리스트 조회를 성공했습니다.',
      data: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl,
      firstEvaluatedUrl: result.firstEvaluatedUrl,
      prevPageUrl: result.prevPageUrl,
      count: result.count,
    };
  }


  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '제품 검색', description: '검색어를 기반으로 제품을 검색하고 정렬합니다.' })
  @ApiResponse({ status: 200, description: '성공적으로 검색 결과를 반환함', type: [Object] })
  async searchProducts(
    @GetUser() user: JwtPayload,
    @Query() searchProductsDto: SearchProductsDto,
  ) {
    const { searchTerm, sortBy, order, limit, exclusiveStartKey, previousPageKey } = searchProductsDto;

    // 현재 위치 정보를 가져옵니다.
    const currentLocation = await this.locationViewRepository.findCurrentLocation(user.userId);
    if (!currentLocation) {
      throw new NotFoundException('현재 위치 정보가 설정되어 있지 않습니다.');
    }
    const { latitude, longitude } = currentLocation;


    const query = new SearchProductsQuery(
      searchTerm,
      sortBy,
      order,
      limit,
      latitude,
      longitude,
      exclusiveStartKey,
      previousPageKey,
    );

    const result = await this.queryBus.execute(query);

    return {
      success: true,
      message: '해당 상품 리스트 조회를 성공했습니다.',
      data: result.items,
      lastEvaluatedUrl: result.lastEvaluatedUrl,
      firstEvaluatedUrl: result.firstEvaluatedUrl,
      prevPageUrl: result.prevPageUrl,
      count: result.count,
    };
  }

  // 위치허용 API
  @Get('nearest')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '가까운 상품 조회', description: '메인화면에서 사용자 위치 기반으로 가까운 상품을 조회합니다.' })
  @ApiResponse({ status: 200, description: '가까운 상품 조회 성공' })
  @ApiQuery({ name: 'lat', type: Number, description: '위도' })
  @ApiQuery({ name: 'lon', type: Number, description: '경도' })
  async getNearestProducts(
    @GetUser() user: JwtPayload,  
  ): Promise<any[]> {
    // 현재 위치 정보를 가져옵니다.
    const currentLocation = await this.locationViewRepository.findCurrentLocation(user.userId);
    if (!currentLocation) {
      throw new NotFoundException('현재 위치 정보가 설정되어 있지 않습니다.');
    }

    // 현재 위치를 사용하여 가까운 상품을 조회하는 쿼리를 생성합니다.
    const query = new GetNearestProductsQuery(currentLocation.latitude, currentLocation.longitude);
    return this.queryBus.execute(query);
  }

  // @Get('category')
  // @ApiOperation({ summary: 'Find products by category and sort' })
  // @ApiResponse({ status: 200, description: 'Return a list of products.' })
  // @ApiResponse({ status: 400, description: 'Bad Request.' })
  // async findProductsByCategoryAndSort(
  //   @Query('category') category: Category,
  //   @Query('sortBy') sortBy: SortByOption,
  //   @Query('order') order: 'asc' | 'desc',
  //   @Query('limit') limit: number,
  //   @Query('exclusiveStartKey') exclusiveStartKey?: string,
  //   @Query('previousPageKey') previousPageKey?: string,
  //   @Query('latitude') latitude?: string,
  //   @Query('longitude') longitude?: string,
  // ): Promise<ProductQueryResult> {
  //   const params: FindProductsParams = {
  //     category,
  //     sortBy,
  //     order,
  //     limit,
  //     exclusiveStartKey,
  //     previousPageKey,
  //     latitude,
  //     longitude,
  //   };
  //   return this.productService.findProductsByCategoryAndSort(params);
  // }
}
