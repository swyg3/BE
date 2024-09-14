import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from "@nestjs/cqrs";
import { DeleteProductCommand } from "../impl/delete-product.command";
import { ProductRepository } from "../../repositories/product.repository";
import { Product } from "src/product/entities/product.entity";
import { DeleteInventoryCommand } from "src/inventory/commands/impl/delete-inventory.command";
import { Logger, Inject, NotFoundException } from "@nestjs/common";
import { DeleteResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductDeletedEvent } from "src/product/events/impl/product-deleted.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  private readonly logger = new Logger(DeleteProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly eventBusService: EventBusService,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) {}

  async execute(command: DeleteProductCommand): Promise<boolean> {
    const { id } = command;

    // 1. 제품 존재 여부 확인
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      this.logger.error(`Product with ID ${id} not found`);
      throw new NotFoundException('Product not found');
    }

    // 2. 제품 삭제
    const deleteResult: DeleteResult = await this.productRepository.delete(id);
    if (deleteResult.affected === 0) {
      this.logger.error(`Failed to delete product with ID ${id}`);
      return false; // 삭제 실패 시 false 반환
    }

    this.logger.log(`Product with ID ${id} has been deleted`);

    // 3. 이벤트 발행
    const productDeletedEvent = new ProductDeletedEvent(id, { updatedAt: new Date() }, 1);
    await this.eventBusService.publishAndSave(productDeletedEvent);
    this.logger.log(`ProductDeletedEvent for product ID ${id} published and saved`);

    // 4. 인벤토리 삭제 명령어 발행
    const deleteInventoryCommand = new DeleteInventoryCommand(id);
    await this.commandBus.execute(deleteInventoryCommand);
    this.logger.log(`DeleteInventoryCommand for product ID ${id} published`);

    return true; // 모든 작업이 성공적으로 완료되면 true 반환
  }
}
