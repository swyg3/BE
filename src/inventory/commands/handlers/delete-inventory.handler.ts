import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { DeleteInventoryCommand } from '../impl/delete-inventory.command';
import { InventoryDeletedEvent } from 'src/inventory/events/impl/inventory-deleted.event';

@CommandHandler(DeleteInventoryCommand)
export class DeleteInventoryHandler implements ICommandHandler<DeleteInventoryCommand> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(command: DeleteInventoryCommand) {
    const { productId } = command;

    // 인벤토리 삭제 로직
    const result = await this.inventoryRepository.delete(productId);
    
    // 인벤토리가 성공적으로 삭제되었을 때 이벤트 발행
    if (result.affected === 1) {
      // 이벤트 발행
      const event = new InventoryDeletedEvent(productId);
      // 이벤트가 처리되게 함 (이벤트 발행 방법에 따라 다름)
      return event;
    }
    
    throw new Error('Inventory not found or could not be deleted');
  }
}
