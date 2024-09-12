import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InventoryRepository } from "../../repositories/inventory.repository";
import { DeleteInventoryCommand } from "../impl/delete-inventory.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Inventory } from "src/inventory/inventory.entity";

@CommandHandler(DeleteInventoryCommand)
export class DeleteInventoryHandler
  implements ICommandHandler<DeleteInventoryCommand>
{
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(command: DeleteInventoryCommand) {
    const { productId } = command;
    // 인벤토리 삭제 로직
    this.inventoryRepository.delete({ productId: productId });
  }
}
