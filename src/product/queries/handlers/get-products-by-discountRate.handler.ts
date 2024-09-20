import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GetProductByDiscountRateDto } from "src/product/dtos/get-products-by-discountRate.dto";
import { ProductView } from "src/product/schemas/product-view.schema";
import { ConfigService } from '@nestjs/config';

@QueryHandler(GetProductByDiscountRateDto)
export class GetProductByDiscountRateHandler
  implements IQueryHandler<GetProductByDiscountRateDto>
{
  constructor(
    @InjectModel(ProductView.name)
    private readonly productViewModel: Model<ProductView>,
    private configService: ConfigService
  ) {}

  async execute(query: GetProductByDiscountRateDto) {
    const { where__id_more_than, take, order__discountRate } = query;
    const filter: any = {};

    // where__id_more_than 필터 적용
    if (where__id_more_than) {
      filter._id = { $gt: where__id_more_than };
    }

    // 제품 조회 및 정렬, 페이징 처리
    const products = await this.productViewModel
      .find(filter)
      .sort({ discountRate: order__discountRate })
      .limit(take || 10)
      .exec();

    const last = products.length > 0 ? products[products.length - 1] : null;

    // 다음 페이지 URL 생성
    let nextUrl: string | null = null;

    if (last) {
      const nextPageQuery = {
        ...query,
        where__id_more_than: last._id.toString(),
      };

      const appUrl = this.configService.get<string>('APP_URL');
      if (appUrl) {
        // appUrl과 경로를 합쳐 URL 객체 생성
        const baseUrl = new URL("/api/products", appUrl);

        for (const [key, value] of Object.entries(nextPageQuery)) {
          if (value !== undefined) {
            baseUrl.searchParams.append(key, value.toString());
          }
        }
        
        nextUrl = baseUrl.toString();
      }
    }

    return {
      data: products,
      cursor: {
        after: last ? last._id.toString() : null, //다음 페이지 첫 상품
      },
      count: products.length, //현재 보여진 상품갯수
      next: nextUrl,
    };
  }
}
