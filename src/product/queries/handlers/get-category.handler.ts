import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GetCategoryDto } from "src/product/dtos/get-category.dto";
import { ProductView } from "src/product/schemas/product-view.schema";
import { Category } from "src/product/product.category";
import { ConfigService } from "@nestjs/config";

export interface DyProductView {
  productId: string;
  sellerId: string;
  category: string;
  name: string;
  productImageUrl: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  availableStock: number;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetCategoryDto)
export class GetCategoryHandler implements IQueryHandler<GetCategoryDto> {
  constructor(
   
    private readonly productViewModel: Model<ProductView>,
    private configService: ConfigService
  ) {}

  async execute(query: GetCategoryDto) {
    const {
      where__id_more_than,
      category,
      order__discountRate,
      order__createdAt,
      take = 5
    } = query;

    const sortField = order__discountRate ? 'discountRate' : 'createdAt';
    const sortOrder = order__discountRate === 'desc' || order__createdAt === 'desc' ? -1 : 1;

    const queryCondition = await this.buildQueryCondition(category, where__id_more_than, sortField);

    const products = await this.productViewModel
      .find(queryCondition)
      .sort({ [sortField]: sortOrder, _id: 1 })
      .limit(Number(take) + 1)
      .exec();

    const hasNextPage = products.length > Number(take);
    const paginatedProducts = products.slice(0, Number(take));
    const last = paginatedProducts[paginatedProducts.length - 1];

    const nextUrl = this.buildNextUrl(hasNextPage, last, query);

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

  private async buildQueryCondition(category: Category | undefined, where__id_more_than: string | undefined, sortField: string) {
    let queryCondition: any = {};
    if (category) queryCondition.category = category;

    if (where__id_more_than) {
      const lastProduct = await this.productViewModel.findById(where__id_more_than);
      if (lastProduct) {
        const lastSortFieldValue = lastProduct[sortField];
        queryCondition = {
          ...queryCondition,
          $or: [
            { [sortField]: { $lt: lastSortFieldValue } },
            {
              [sortField]: lastSortFieldValue,
              _id: { $gt: where__id_more_than }
            }
          ]
        };
      }
    }

    return queryCondition;
  }

  private buildNextUrl(hasNextPage: boolean, last: any, query: GetCategoryDto): string | null {
    if (!hasNextPage || !last) return null;

    const { category, take, order__discountRate, order__createdAt } = query;
    const appUrl = this.configService.get<string>('APP_URL');
    if (!appUrl) return null;

    const nextPageQuery = {
      where__id_more_than: last._id.toString(),
      category: category ? Category[category] : undefined,
      take: take?.toString(),
      order__discountRate,
      order__createdAt,
    };

    const baseUrl = new URL("/api/products/category", appUrl);
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(nextPageQuery)) {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    }

    baseUrl.search = searchParams.toString();
    return baseUrl.toString();
  }
}