import { EntityRepository, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../product.category';
import { Product } from '../product.entity';

@Injectable()
@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  productRepository: any;
  


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
    category: Category;
    name: string;
    productImageUrl: string;
    description: string;
    originalPrice: number;
    discountedPrice: number;
  }): Promise<Product> {
    const product = this.productRepository.create({
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    });
    return await this.productRepository.save(product);
  }
}


