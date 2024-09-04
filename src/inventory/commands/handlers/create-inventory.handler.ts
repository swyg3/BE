import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateInventoryCommand } from '../impl/create-inventory.command';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { InventoryCreatedEvent } from '../../events/impl/inventory-created.event';
import { Logger } from '@nestjs/common';

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler implements ICommandHandler<CreateInventoryCommand> {
  private readonly logger = new Logger(CreateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateInventoryCommand): Promise<void> {
    this.logger.log(`Handling CreateInventoryCommand for product: ${command.productId}`);

    // Inventory 생성 로직
    try {
        // db 저장
      const inventory = await this.inventoryRepository.createInventory({
        productId: command.productId,
        quantity: command.quantity,
        expirationDate: command.expirationDate,
      });

      this.logger.log(`Inventory created successfully for product: ${command.productId} with Inventory ID: ${inventory.Id}`);

      // InventoryCreatedEvent 발행
      const inventoryCreatedEvent = new InventoryCreatedEvent(
        inventory.Id,
        inventory.productId,
        inventory.quantity,
        inventory.expirationDate,
        inventory.createdAt,
        inventory.updatedAt
      );

      this.logger.log(`Publishing InventoryCreatedEvent for Inventory ID: ${inventory.inventoryId}`);
      this.eventBus.publish(inventoryCreatedEvent);

    } catch (error) {
      this.logger.error(`Failed to create inventory for product: ${command.productId}. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
