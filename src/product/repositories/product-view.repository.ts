import { Injectable } from '@nestjs/common';
import {  Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductView } from '../schemas/product-view.schema';
@Injectable()
export class ProductViewRepository {
    deletedProduct(arg0: { Id: number; }) {
        throw new Error('Method not implemented.');
    }
    constructor(
        @InjectModel(ProductView.name) private productViewModel: Model<ProductView>
      ) {}
  
  async createProduct(productView: Partial<ProductView>): Promise<ProductView> {
    const createProductView = new this.productViewModel(productView);  
    return createProductView.save();  
  }

}
