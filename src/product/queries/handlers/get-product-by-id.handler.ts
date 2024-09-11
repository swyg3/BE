import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductView } from '../../schemas/product-view.schema'; 
import { GetProductByIdQuery } from '../impl/get-product-by-id.query';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
  constructor(
    @InjectModel(ProductView.name) 
    private readonly productViewModel: Model<ProductView>,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<ProductView> {
    const { id } = query;

    const product = await this.productViewModel.findOne({ id }).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }
}
