import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductView } from '../../schemas/product-view.schema';
import { GetProductByIdQuery } from '../impl/get-product-by-id.query';
import { NotFoundException } from '@nestjs/common';
import { PRODUCTS_PUBLIC_IMAGE_PATH } from '../../const/path.const';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    @InjectModel(ProductView.name)
    private readonly productViewModel: Model<ProductView>,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<any> {
    const { id } = query;

    const product = await this.productViewModel.findOne({ id }).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const transformedProduct = {
      ...product.toObject(),
      productImageUrl: product.productImageUrl
        ? `/${PRODUCTS_PUBLIC_IMAGE_PATH}/${product.productImageUrl}`
        : null,
    };

    return {
      success: true,
      message: '해당 상품 상세 조회를 성공했습니다.',
      data: transformedProduct,
    };
  }
}
