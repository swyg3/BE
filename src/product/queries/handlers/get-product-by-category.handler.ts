import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ProductView, ProductViewRepository, SortByOption } from "../../repositories/product-view.repository";
import { ConfigService } from "@nestjs/config";
import { FindProductsByCategoryQuery } from "../impl/get-product-by-category.query";
import { GetCategoryQueryOutputDto } from "src/product/dtos/get-category-out-dto";
import { Category } from "src/product/product.category";


@QueryHandler(FindProductsByCategoryQuery)
export class FindProductsByCategoryHandler implements IQueryHandler<FindProductsByCategoryQuery> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async execute(query: FindProductsByCategoryQuery): Promise<GetCategoryQueryOutputDto> {
    this.logger.log(`Executing find products by category query with parameters: ${JSON.stringify(query)}`);

    const validatedQuery = this.validateAndConvertQuery(query);
    const result = await this.productViewRepository.findProductsByCategoryAndSort(validatedQuery);
    const formattedResult = this.formatResult(result, query);

    this.logger.log(`Query result: ${formattedResult.count} items found`);

    return formattedResult;
  }

  private validateAndConvertQuery(query: FindProductsByCategoryQuery): {
    category: Category;
    sortBy: SortByOption;
    order: 'asc' | 'desc';
    limit: number;
    latitude?: string;
    longitude?: string;
    exclusiveStartKey?: string;
  } {
    const category = Category[query.category as keyof typeof Category];
    if (!category) {
      throw new Error(`Invalid category: ${query.category}`);
    }

    const sortBy = SortByOption[query.sortBy as keyof typeof SortByOption];
    if (!sortBy) {
      throw new Error(`Invalid sortBy option: ${query.sortBy}`);
    }

    if (query.order !== 'asc' && query.order !== 'desc') {
      throw new Error(`Invalid order: ${query.order}`);
    }

    if (isNaN(query.limit) || query.limit <= 0) {
      throw new Error(`Invalid limit: ${query.limit}`);
    }

    return {
      category,
      sortBy,
      order: query.order,
      limit: query.limit,
      latitude: query.latitude,
      longitude: query.longitude,
      exclusiveStartKey: query.exclusiveStartKey,
    };
  }

  private formatResult(
    result: { items: ProductView[], lastEvaluatedKey: any },
    query: FindProductsByCategoryQuery
  ): GetCategoryQueryOutputDto {
    const { category, sortBy, order, limit, latitude, longitude, previousPageKey } = query;
    const { items, lastEvaluatedKey } = result;

    const appUrl = this.configService.get<string>('APP_URL');
    const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
      if (!key || !appUrl) return null;
      const baseUrl = new URL("/api/products/category", appUrl);
      baseUrl.searchParams.append('category', category);
      baseUrl.searchParams.append('sortBy', sortBy);
      baseUrl.searchParams.append('order', order);
      baseUrl.searchParams.append('limit', limit.toString());
      if (latitude) baseUrl.searchParams.append('latitude', latitude);
      if (longitude) baseUrl.searchParams.append('longitude', longitude);
      baseUrl.searchParams.append('exclusiveStartKey', encodeURIComponent(JSON.stringify(key)));
      if (prevKey) {
        baseUrl.searchParams.append('previousPageKey', encodeURIComponent(prevKey));
      }
      return baseUrl.toString();
    };

    const firstEvaluatedKey = items.length > 0 ? { productId: items[0].productId } : null;
    const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey, previousPageKey);
    const lastEvaluatedUrl = lastEvaluatedKey ? createUrlWithKey(lastEvaluatedKey, JSON.stringify(firstEvaluatedKey)) : null;

    let prevPageUrl: string | null = null;
    if (previousPageKey) {
      const prevKey = JSON.parse(decodeURIComponent(previousPageKey));
      prevPageUrl = createUrlWithKey(prevKey, null);
    }

    return {
      success: true,
      message: '해당 상품 리스트 조회를 성공했습니다.',
      items,
      lastEvaluatedUrl,
      firstEvaluatedUrl,
      prevPageUrl,
      count: items.length
    };
  }
}