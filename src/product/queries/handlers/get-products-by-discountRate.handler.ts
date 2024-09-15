import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetProductByDiscountRate } from 'src/product/dtos/get-products-by-discountRate.dto';
import { ProductView } from 'src/product/schemas/product-view.schema';


@QueryHandler(GetProductByDiscountRate)
export class GetProductByDiscountRateHandler implements IQueryHandler<GetProductByDiscountRate> {
    constructor(
        @InjectModel(ProductView.name) private readonly productViewModel: Model<ProductView>,
      ) {}
    

  async execute(query: GetProductByDiscountRate) {
    const { where__id_more_than, take, order__discountRate } = query;
    const filter: any = {};

    if (where__id_more_than) {
      filter._id = { $gt: where__id_more_than };
    }

    const products = await this.productViewModel
      .find(filter)
      .sort({ discountRate: order__discountRate })
      .limit(take || 10)
      .exec();

    const last = products.length > 0 ? products[products.length - 1] : null;

    let nextUrl = null;
    if (last) {
      const nextPageQuery = { ...query, where__id_more_than: last._id.toString() };
      nextUrl = new URL("http://localhost:3000/api/products");
      for (const [key, value] of Object.entries(nextPageQuery)) {
        if (value !== undefined) {
          nextUrl.searchParams.append(key, value.toString());
        }
      }
    }

    return {
      data: products,
      cursor: {
        after: last ? last._id.toString() : null,
      },
      count: products.length,
      next: nextUrl ? nextUrl.toString() : null,
    };
  }
}
