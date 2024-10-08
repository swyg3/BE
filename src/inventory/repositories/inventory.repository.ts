import { Injectable } from "@nestjs/common";
import { DeepPartial, DeleteResult, In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Inventory } from "../inventory.entity";

@Injectable()
export class InventoryRepository {
  delete: any;
  deleteone: any;
  create: any;
  save: any;

  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  async createInventory({
    productId,
    quantity,
    expirationDate,
  }: {
    productId: string;
    quantity: number;
    expirationDate: Date;
  }): Promise<Inventory | undefined> {
    const inventory = this.repository.create({
      productId,
      quantity,
      expirationDate,
    } as DeepPartial<Inventory>);

    return await this.repository.save(inventory);
  }

  async findById(productId: string): Promise<Inventory | null> {
    return this.repository.findOneBy({
      id: productId,
    });
  }

  async findOneByProductId(productId: string): Promise<Inventory | null> {
    return this.repository.findOne({
      where: { productId },
    });
  }
  
  async findManyByProductIds(productIds: string[]): Promise<Inventory[]> {
    return this.repository.find({
      where: { productId: In(productIds) },
    });
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.repository.delete({ productId });
  }
}
