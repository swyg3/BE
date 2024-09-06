import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InventoryCreatedEvent } from '../impl/inventory-created.event'; 
import { InventoryViewRepository } from 'src/inventory/repositories/inventory-view.repository';

@EventsHandler(InventoryCreatedEvent)
export class InventoryCreatedHandler implements IEventHandler<InventoryCreatedEvent> {
  private readonly logger = new Logger(InventoryCreatedHandler.name);

  constructor(private readonly inventoryViewRepository: InventoryViewRepository) {}

  async handle(event: InventoryCreatedEvent) {
    this.logger.log(`Handling InventoryCreatedEvent for inventory: ${event.id}`);

    try {
      await this.inventoryViewRepository.createInventory({
        id: event.id,
        productId: event.productId,
        quantity: event.quantity,
        expirationDate: event.expirationDate,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      });

      this.logger.log(`Inventory view successfully updated: ${event.id}`);
    } catch (error) {
      this.logger.error(`Failed to update inventory view: ${event.id}, ${error.message}`, error.stack);
    }
  }
}
