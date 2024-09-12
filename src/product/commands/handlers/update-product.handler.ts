import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from "@nestjs/cqrs";
import { ProductRepository } from "../../repositories/product.repository";
import { Product } from "../../entities/product.entity";
import { NotFoundException } from "@nestjs/common";
import { Logger, Inject } from "@nestjs/common";
import { EventStoreService } from "src/shared/event-store/event-store.service";
import { ProductUpdatedEvent } from "src/product/events/impl/product-updated.event";
import { UpdateProductCommand } from "../impl/update-product.command";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateInventoryCommand } from "src/inventory/commands/impl/update-inventory.command";
import { ProductViewRepository } from "./../../repositories/product-view.repository";
import { ProductView } from "src/product/schemas/product-view.schema";

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  private readonly logger = new Logger(UpdateProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly productViewRepository: ProductViewRepository,
    private readonly eventStoreService: EventStoreService,
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const { id, updates } = command;

    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 업데이트 적용
    if (updates.name) product.name = updates.name;
    if (updates.productImageUrl)
      product.productImageUrl = updates.productImageUrl;
    if (updates.description) product.description = updates.description;
    if (updates.originalPrice) product.originalPrice = updates.originalPrice;
    if (updates.discountedPrice)
      product.discountedPrice = updates.discountedPrice;
    if (updates.quantity) product.quantity = updates.quantity;
    if (updates.expirationDate) product.expirationDate = updates.expirationDate;

    // Inventory 업데이트
    if (
      updates.quantity !== undefined ||
      updates.expirationDate !== undefined
    ) {
      const expirationDate = updates.expirationDate
        ? new Date(updates.expirationDate)
        : undefined;
      const updateInventoryCommand = new UpdateInventoryCommand(
        id,
        updates.quantity,
        expirationDate,
      );
      await this.commandBus.execute(updateInventoryCommand);
    }

    await this.productRepository.save(product);

    this.logger.log(`Product with ID ${id} has been updated`);

    // 이벤트 생성
    const productUpdatedEvent = new ProductUpdatedEvent(
      id,
      updates.name,
      updates.productImageUrl,
      updates.description,
      updates.originalPrice,
      updates.discountedPrice,
      updates.quantity,
    );

    // 이벤트 저장
    await this.eventStoreService.saveEvent({
      aggregateId: id.toString(),
      aggregateType: "Product",
      eventType: productUpdatedEvent.constructor.name,
      eventData: productUpdatedEvent,
      version: 1,
    });

    // ProductUpdatedEvent 생성
    const discountRate =
      updates.originalPrice && updates.discountedPrice
        ? ((updates.originalPrice - updates.discountedPrice) /
            updates.originalPrice) *
          100
        : 0;

    const productUpdatedEventWithDetails = new ProductUpdatedEvent(
      id,
      updates.name,
      updates.productImageUrl,
      updates.description,
      updates.originalPrice,
      updates.discountedPrice,
      discountRate,
      updates.quantity,
      updates.expirationDate,
      product.createdAt, // 기존의 createdAt
      new Date(), // updatedAt
    );

    // 이벤트 버스에 이벤트 게시
    this.logger.log(`Publishing productUpdatedEvent for product ID: ${id}`);
    this.eventBus.publish(productUpdatedEventWithDetails);

    this.logger.log(`ProductUpdatedEvent for product ID ${id} saved`);

    // 업데이트된 ProductView를 기다려서 반환
    let productView: ProductView;
    do {
      productView = await this.productViewRepository.findById(id);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms 대기
    } while (!productView);

    return productView;
  }
}
