import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from "@nestjs/cqrs";
import { DeleteProductCommand } from "../impl/delete-product.command";
import { ProductRepository } from "../../repositories/product.repository";
import { Product } from "src/product/entities/product.entity";
import { DeleteInventoryCommand } from "src/inventory/commands/impl/delete-inventory.command";
import { EventStoreService } from "src/shared/event-store/event-store.service";
import { ProductDeletedEvent } from "src/product/events/impl/product-deleted.event"; // Product 삭제 이벤트
import { Logger, Inject, NotFoundException } from "@nestjs/common";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NOTFOUND } from "dns";
import { ProductAggregate } from "src/product/aggregates/product.aggregate";

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand>
{
  private readonly logger = new Logger(DeleteProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly eventStoreService: EventStoreService,
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(CommandBus) private readonly commandbus: CommandBus,
  ) {}

  async execute(command: DeleteProductCommand) {
    const { id } = command;

    const productAggregate = new ProductAggregate(id);
    const events = productAggregate.deleteProduct(id);

    // 이벤트 저장소에 저장
    for (const event of events) {
      await this.eventStoreService.saveEvent({
        aggregateId: id.toString(),
        aggregateType: "Product",
        eventType: event.constructor.name,
        eventData: event,
        version: 1,
      });
    }

    this.productRepository.delete({ id: id });

    const productViewDeletedEvent = new ProductDeletedEvent(id);
    await this.eventBus.publish(productViewDeletedEvent);

    this.logger.log(`Product with ID ${id} has been deleted`);

    const productId = id;

    // Inventory 삭제 명령어 발행
    const deleteInventoryCommand = new DeleteInventoryCommand(productId); // Product ID를 Inventory 삭제 명령에 사용
    await this.commandbus.execute(deleteInventoryCommand);

    this.logger.log(`DeleteInventoryCommand for product ID ${id} published`);

    // Event 저장소에 Product 삭제 이벤트 저장
    const productDeletedEvent = new ProductDeletedEvent(id);
    await this.eventStoreService.saveEvent({
      aggregateId: id.toString(),
      aggregateType: "Product",
      eventType: productDeletedEvent.constructor.name,
      eventData: productDeletedEvent,
      version: 1,
    });

    this.logger.log(`ProductDeletedEvent for product ID ${id} saved`);
  }
}
