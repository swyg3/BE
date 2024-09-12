import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  findOneBy: any;
    findByStoreId(stellerId: any) {
        throw new Error('Method not implemented.');
    }
  save: any;
  create: any;
  deleteOne: any;
  findOne: any;
  delete: any;
  findById: any;
  
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async createProduct({
    sellerId,
    category,
    name,
    productImageUrl,
    description,
    originalPrice,
    discountedPrice,
  }: {
    sellerId: number;
    category: string;
    name: string;
    productImageUrl: string;
    description: string;
    originalPrice: number;
    discountedPrice: number;
  }): Promise<Product| undefined> {

    const product = this.repository.create({
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    }as DeepPartial<Product>);

    return await this.repository.save(product);
  }
  
}
