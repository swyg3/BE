import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateInventoryCommand } from '../impl/create-inventory.command';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { InventoryCreatedEvent } from '../../events/impl/inventory-created.event';
import { Inject, Logger } from '@nestjs/common';
import { EventStoreService } from 'src/shared/event-store/event-store.service';

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler implements ICommandHandler<CreateInventoryCommand> {
  private readonly logger = new Logger(CreateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventStoreService: EventStoreService,
    @Inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateInventoryCommand): Promise<void> {
    const { productId, quantity, expirationDate } = command;

    try {
      // Inventory 생성 로직
      const inventory = await this.inventoryRepository.createInventory({
        productId: productId, 
        quantity: quantity,
        expirationDate: expirationDate,
      });

      this.logger.log(`Inventory created successfully for product: ${productId} with Inventory ID: ${inventory.Id}`);

      // InventoryCreatedEvent 발행
      const inventoryCreatedEvent = new InventoryCreatedEvent(
        inventory.Id,
        inventory.productId,
        inventory.quantity,
        inventory.expirationDate,
        inventory.updatedAt
      );

      this.logger.log(`Publishing InventoryCreatedEvent for Inventory ID: ${inventory.Id}`);
      this.eventBus.publish(inventoryCreatedEvent);

    } catch (error) {
      this.logger.error(`Failed to create inventory for product: ${productId}. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
