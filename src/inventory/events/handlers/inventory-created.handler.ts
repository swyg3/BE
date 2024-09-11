import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { InventoryCreatedEvent } from '../../events/impl/inventory-created.event';
import { Inject, Logger } from '@nestjs/common';
import { CreateInventoryCommand } from 'src/inventory/commands/impl/create-inventory.command';

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler implements ICommandHandler<CreateInventoryCommand> {
  private readonly logger = new Logger(CreateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    @Inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateInventoryCommand): Promise<void> {
    const { Id, quantity, expirationDate } = command;

    try {
      // Inventory 생성 로직
      const inventory = this.inventoryRepository.createInventory({
        productId: Id,
        quantity: quantity,
        expirationDate: expirationDate,
      });

      // Inventory 저장
      const savedInventory = await inventory;  // await 추가

      // InventoryCreatedEvent 발행
      const inventoryCreatedEvent = new InventoryCreatedEvent(
        savedInventory.Id,
        savedInventory.productId,
        savedInventory.quantity,
        savedInventory.expirationDate,
        savedInventory.updatedAt
      );

      this.eventBus.publish(inventoryCreatedEvent);

    } catch (error) {
      this.logger.error(`Failed to create inventory for product: ${Id}. Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}