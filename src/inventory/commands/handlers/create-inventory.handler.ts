import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { CreateInventoryCommand } from "../impl/create-inventory.command";
import { InventoryRepository } from "../../repositories/inventory.repository";
import { InventoryCreatedEvent } from "../../events/impl/inventory-created.event";
import { Inject, Logger } from "@nestjs/common";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler
  implements ICommandHandler<CreateInventoryCommand>
{
  private readonly logger = new Logger(CreateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: CreateInventoryCommand): Promise<void> {
    const { id, quantity, expirationDate } = command;

    try {
      // Inventory 생성 로직
      const inventory = this.inventoryRepository.createInventory({
        productId: id,
        quantity: quantity,
        expirationDate: expirationDate,
      });

      // Inventory 저장
      const savedInventory = await inventory; // await 추가

      // InventoryCreatedEvent 발행
      const inventoryCreatedEvent = new InventoryCreatedEvent(
        savedInventory.id, // aggregateId (number)
        {
          productId: savedInventory.productId,
          quantity: savedInventory.quantity,
          expirationDate: savedInventory.expirationDate,
          updatedAt: new Date(), // 현재 시간
        },
        1 // version
      );
      
      await this.eventBusService.publishAndSave(inventoryCreatedEvent);
    } catch (error) {
      this.logger.error(
        `Failed to create inventory for product: ${id}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
