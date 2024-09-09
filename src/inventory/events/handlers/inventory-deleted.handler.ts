import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InventoryDeletedEvent } from '../impl/inventory-deleted.event';
import { InventoryViewRepository } from '../../repositories/inventory-view.repository';

@EventsHandler(InventoryDeletedEvent)
export class InventoryDeletedHandler implements IEventHandler<InventoryDeletedEvent> {
  constructor(private readonly inventoryViewRepository: InventoryViewRepository) {}

  async handle(event: InventoryDeletedEvent) {
    try {
      // ID를 사용하여 인벤토리 삭제
      await this.inventoryViewRepository.deleteInventoryById(event.productId);

      console.log(`Inventory with ID ${event.productId} has been deleted`);
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  }
}
