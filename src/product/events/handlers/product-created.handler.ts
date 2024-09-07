import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductViewRepository } from '../../repositories/product-view.repository';
import { Logger } from '@nestjs/common';
import { ProductCreatedEvent } from '../impl/product-created.event';

@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler implements IEventHandler<ProductCreatedEvent> {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async handle(event: ProductCreatedEvent) {
    this.logger.log(`Handling ProductCreatedEvent for product: ${event.Id}`);

    try {
      await this.productViewRepository.createProduct({
        Id: event.Id,
        sellerId: event.sellerId,
        category: event.category,
        name: event.name,
        productImageUrl: event.productImageUrl,
        description: event.description,
        originalPrice: event.originalPrice,
        discountedPrice: event.discountedPrice,
        discountRate: event.discountRate,
        availableStock: event.availableStock,
        expirationDate: event.expirationDate,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      });

      this.logger.log(`Product view successfully updated: ${event.Id}`);
    } catch (error) {
      this.logger.error(`Failed to update product view: ${event.Id}, ${error.message}`, error.stack);
    }
  }
}
