import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { DyProductViewRepository } from "../../repositories/dy-product-view.repository";
import { DyProductCreatedEvent } from "../impl/dy-product-created.event";

@EventsHandler(DyProductCreatedEvent)
export class DyProductCreatedHandler
  implements IEventHandler<DyProductCreatedEvent>
{
  private readonly logger = new Logger(DyProductCreatedHandler.name);

  constructor(
    private readonly dyProductViewRepository: DyProductViewRepository,
  ) {}

  async handle(event: DyProductCreatedEvent) {
    this.logger.log(`ProductCreatedEvent 처리중: ${event.aggregateId}`);

    try {
      await this.dyProductViewRepository.create({
        productId: event.aggregateId,
        sellerId: event.data.sellerId,
        category: event.data.category,
        name: event.data.name,
        productImageUrl: event.data.productImageUrl,
        description: event.data.description,
        originalPrice: Number(event.data.originalPrice),
        discountedPrice: Number(event.data.discountedPrice),
        discountRate: Number(event.data.discountRate),
        availableStock: Number(event.data.availableStock),
        expirationDate: event.data.expirationDate,
        createdAt: event.data.createdAt || new Date(), 
        updatedAt: event.data.updatedAt || new Date(), 
      });

      this.logger.log(`ProductView 등록 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `ProductView 등록 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
