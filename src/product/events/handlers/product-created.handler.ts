import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ProductViewRepository } from "../../repositories/product-view.repository";
import { Logger } from "@nestjs/common";
import { ProductCreatedEvent } from "../impl/product-created.event";

@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler
  implements IEventHandler<ProductCreatedEvent>
{
  private readonly logger = new Logger(ProductCreatedHandler.name);

  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async handle(event: ProductCreatedEvent) {
    this.logger.log(`Handling ProductCreatedEvent for product: ${event.aggregateId}`);

    try {
      this.logger.log(event.data.expirationDate);
      await this.productViewRepository.createProduct({
        id: event.aggregateId,
        sellerId: event.data.sellerId,
        category: event.data.category,
        name: event.data.name,
        productImageUrl: event.data.productImageUrl,
        description: event.data.description,
        originalPrice: event.data.originalPrice,
        discountedPrice: event.data.discountedPrice,
        discountRate: event.data.discountRate,
        availableStock: event.data.availableStock,
        expirationDate: event.data.expirationDate,
        createdAt: event.data.createdAt,
        updatedAt: event.data.updatedAt,
      });

      this.logger.log(`Product view successfully updated: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update product view: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
