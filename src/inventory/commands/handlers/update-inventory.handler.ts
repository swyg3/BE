import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException, Logger } from "@nestjs/common";
import { UpdateInventoryCommand } from "../impl/update-inventory.command";
import { Inventory } from "src/inventory/inventory.entity";
import { InventoryUpdatedEvent } from "src/inventory/events/impl/inventory-updated.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

@CommandHandler(UpdateInventoryCommand)
export class UpdateInventoryHandler
  implements ICommandHandler<UpdateInventoryCommand>
{
  private readonly logger = new Logger(UpdateInventoryHandler.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly eventBusService: EventBusService, // 이벤트 버스 서비스 주입
  ) {}

  async execute(command: UpdateInventoryCommand): Promise<void> {
    const { productId, quantity, expirationDate } = command;

    // 인벤토리 항목을 데이터베이스에서 찾기
    const inventory = await this.inventoryRepository.findOneBy({ productId });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory for product ID ${productId} not found`,
      );
    }

    // 수량 및 만료일 업데이트
    if (quantity !== undefined) {
      inventory.quantity = quantity;
    }
    if (expirationDate !== undefined) {
      inventory.expirationDate = expirationDate;
    }

    // 업데이트된 인벤토리 저장
    await this.inventoryRepository.save(inventory);

    this.logger.log(
      `Inventory for product ID ${productId} updated successfully`,
    );

    // 이벤트 생성
    const inventoryUpdatedEvent = new InventoryUpdatedEvent(
      inventory.id, // aggregateId (number)
      {
        productId,
        quantity,
        expirationDate,
        updatedAt: new Date(), // 현재 시각
      },
      1, // version
    );

    // 이벤트 발행 및 저장
    await this.eventBusService.publishAndSave(inventoryUpdatedEvent);
  }
}
