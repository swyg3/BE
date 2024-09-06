import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../inventory.entity';

@Injectable()
export class InventoryRepository {
  save: any;
  create: any;
  delete: any;

  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  async createInventory({
    productId,
    quantity,
    expirationDate,
  }: {
    productId: number;
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
}
