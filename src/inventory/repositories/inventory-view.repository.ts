import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InventoryView } from '../schemas/inventory-view.schema';

@Injectable()
export class InventoryViewRepository {
  constructor(
    @InjectModel(InventoryView.name) private inventoryViewModel: Model<InventoryView>
  ) {}

  async createInventory(inventoryView: Partial<InventoryView>): Promise<InventoryView> {
    const createInventoryView = new this.inventoryViewModel(inventoryView);  
    return createInventoryView.save();
  }
}
