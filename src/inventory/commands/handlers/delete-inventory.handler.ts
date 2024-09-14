import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { DeleteInventoryCommand } from '../impl/delete-inventory.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/inventory.entity';
import { InventoryDeletedEvent } from 'src/inventory/events/impl/inventory-deleted.event';
import { EventBusService } from 'src/shared/infrastructure/event-sourcing/event-bus.service';

@CommandHandler(DeleteInventoryCommand)
export class DeleteInventoryHandler
  implements ICommandHandler<DeleteInventoryCommand>
{
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: DeleteInventoryCommand): Promise<void> {
    const { productId } = command;

    // productId로 인벤토리 조회
    const inventory = await this.inventoryRepository.findOneByProductId(productId);

    if (!inventory) {
      // 인벤토리를 찾을 수 없는 경우 처리
      throw new Error(`Inventory with productId ${productId} not found`);
    }

    // 인벤토리 삭제
    await this.inventoryRepository.deleteByProductId(productId);

    // InventoryDeletedEvent 발행
    const inventoryDeletedEvent = new InventoryDeletedEvent(
      inventory.id, // aggregateId (number), 인벤토리의 id 사용
      {
        productId,
        deletedAt: new Date(), // 현재 시간
      },
      1 // version
    );

    await this.eventBusService.publishAndSave(inventoryDeletedEvent);
  }
}
