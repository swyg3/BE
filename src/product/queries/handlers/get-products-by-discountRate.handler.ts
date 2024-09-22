import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GetProductByDiscountRateDto } from "src/product/dtos/get-products-by-discountRate.dto";
import { ProductView } from "src/product/schemas/product-view.schema";
import { ConfigService } from '@nestjs/config';

@QueryHandler(GetProductByDiscountRateDto)
export class GetProductByDiscountRateHandler
  implements IQueryHandler<GetProductByDiscountRateDto> {
  constructor(
    @InjectModel(ProductView.name)
    private readonly productViewModel: Model<ProductView>,
    private configService: ConfigService
  ) {}

  async execute(query: GetProductByDiscountRateDto) {
    const { where__id_more_than, take = 5 } = query;

    // 쿼리 조건 설정
    const queryCondition = where__id_more_than
      ? { _id: { $gt: where__id_more_than } }
      : {};

    // 데이터베이스에서 정렬 및 페이지네이션 적용
    const products = await this.productViewModel
      .find(queryCondition)
      .sort({ discountRate: -1 })
      .limit(take + 1)  // 다음 페이지 확인을 위해 1개 더 가져옴
      .exec();

    const hasNextPage = products.length > take;
    const paginatedProducts = products.slice(0, take);

    const last = paginatedProducts[paginatedProducts.length - 1];

    // 다음 페이지 URL 생성
    let nextUrl: string | null = null;
    if (hasNextPage) {
      const nextPageQuery = {
        where__id_more_than: last._id.toString(),
        take: take.toString(),
      };

      const appUrl = this.configService.get<string>('APP_URL');
      if (appUrl) {
        const baseUrl = new URL("/api/products", appUrl);
        const searchParams = new URLSearchParams(nextPageQuery as any);
        baseUrl.search = searchParams.toString();
        nextUrl = baseUrl.toString();
      }
    }

    return {
      data: paginatedProducts,
      cursor: {
        after: last ? last._id.toString() : null,
      },
      count: paginatedProducts.length,
      next: nextUrl,
      hasNextPage,
    };
  }
}