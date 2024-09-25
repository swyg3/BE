// import { ConfigService } from "@nestjs/config";
// import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
// import { GetCategoryDto } from "src/product/dtos/get-category.dto";
// import { DyProductViewRepository } from "src/product/repositories/dy-product-view.repository";


// @QueryHandler(GetCategoryDto)
// export class GetCategoryHandler implements IQueryHandler<GetCategoryDto> {
//   constructor(
//     private readonly dyProductViewRepository: DyProductViewRepository,
//     private configService: ConfigService
//   ) {}

//   async execute(query: GetCategoryDto) {
//     const {
//       where__id_more_than,
//       category,
//       order__discountRate,
//       order__createdAt,
//       take = 5
//     } = query;

//     const result = await this.dyProductViewRepository.findProductsByCategory({
//       category,
//       exclusiveStartKey: where__id_more_than,
//       limit: Number(take) + 1,
//       sortKey: order__discountRate ? 'discountRate' : 'createdAt',
//       scanForward: !(order__discountRate === 'desc' || order__createdAt === 'desc')
//     });

//     const hasNextPage = result.items.length > Number(take);
//     const paginatedProducts = result.items.slice(0, Number(take));
//     const last = paginatedProducts[paginatedProducts.length - 1];

//     const nextUrl = this.buildNextUrl(hasNextPage, last, query);

//     return {
//       data: paginatedProducts,
//       cursor: {
//         after: last ? last.productId : null,
//       },
//       count: paginatedProducts.length,
//       next: nextUrl,
//       hasNextPage,
//     };
//   }

//   private buildNextUrl(hasNextPage: boolean, last: any, query: GetCategoryDto): string | null {
//     if (!hasNextPage || !last) return null;

//     const { category, take, order__discountRate, order__createdAt } = query;
//     const appUrl = this.configService.get<string>('APP_URL');
//     if (!appUrl) return null;

//     const nextPageQuery = {
//       where__id_more_than: last.productId,
//       category: category ? Category[category] : undefined,
//       take: take?.toString(),
//       order__discountRate,
//       order__createdAt,
//     };

//     const baseUrl = new URL("/api/products/category", appUrl);
//     const searchParams = new URLSearchParams();

//     for (const [key, value] of Object.entries(nextPageQuery)) {
//       if (value !== undefined) {
//         searchParams.append(key, value.toString());
//       }
//     }

//     baseUrl.search = searchParams.toString();
//     return baseUrl.toString();
//   }
// }