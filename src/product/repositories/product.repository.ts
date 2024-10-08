import { Injectable } from "@nestjs/common";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "../entities/product.entity";
import { Category } from "../product.category";

@Injectable()
export class ProductRepository {
  
  findOneBy: any;
  findByStoreId(stellerId: any) {
    throw new Error("Method not implemented.");
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
  
  // private async fetchProductsFromPostgres(category: Category): Promise<Product[]> {
  //   if (category === Category.ALL) {
  //     return this.repository.createQueryBuilder('product')
  //       .leftJoinAndSelect('product.inventory', 'inventory')
  //       .where('inventory.quantity > :minQuantity', { minQuantity: 0 })
  //       .orderBy('product.updatedAt', 'DESC')
  //       .take(100)
  //       .getMany();
  //   } else {
  //     return this.findByCategory(category);
  //   }
  // }

  // async findByCategory(category: Category): Promise<Product[]> {
  //   return this.createQueryBuilder('product')
  //     .leftJoinAndSelect('product.inventory', 'inventory')
  //     .where('product.category = :category', { category })
  //     .andWhere('inventory.quantity > :minQuantity', { minQuantity: 0 })
  //     .orderBy('product.discountrate', 'DESC')
  //     .getMany();
  // }

  // async findByStoreId(sellerId: string): Promise<Product[]> {
  //   return this.createQueryBuilder('product')
  //     .leftJoinAndSelect('product.inventory', 'inventory')
  //     .where('product.sellerId = :sellerId', { sellerId })
  //     .andWhere('inventory.quantity > :minQuantity', { minQuantity: 0 })
  //     .orderBy('product.updatedAt', 'DESC')
  //     .getMany();
  // }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }


  async createProduct({
    sellerId,
    category,
    name,
    productImageUrl,
    description,
    originalPrice,
    discountedPrice,
  }: {
    sellerId: string;
    category: string;
    name: string;
    productImageUrl: string;
    description: string;
    originalPrice: number;
    discountedPrice: number;
  }): Promise<Product | undefined> {
    const product = this.repository.create({
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    } as DeepPartial<Product>);

    return await this.repository.save(product);
  }
}
