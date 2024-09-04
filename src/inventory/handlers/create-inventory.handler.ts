// src/inventory/handlers/create-inventory.handler.ts
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateInventoryCommand } from '../commands/impl/create-inventory.command';
import { InventoryCreatedEvent } from '../events/impl/inventory-created.event';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler implements ICommandHandler<CreateInventoryCommand> {
  private readonly logger = new Logger(CreateInventoryHandler.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: CreateInventoryCommand) {
    const { productId, quantity, expirationDate } = command;

    // Inventory 생성
    const inventory = this.inventoryRepository.create({
      productId,
      quantity,
      expirationDate,
    });
    await this.inventoryRepository.save(inventory);

    this.logger.log(`Inventory created for productId: ${productId}`);

    // InventoryCreatedEvent 생성 및 발행
    const inventoryCreatedEvent = new InventoryCreatedEvent(
      inventory.productId, 
      productId,
      quantity,
      expirationDate,
      new Date(), // createdAt
      new Date(), // updatedAt
    );

    this.eventBus.publish(inventoryCreatedEvent);
    this.logger.log(`Published InventoryCreatedEvent for productId: ${productId}`);
  }
}
