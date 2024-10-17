import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InventoryUpdatedEvent } from '../impl/inventory-updated.event';
import { ProductViewRepository } from 'src/product/repositories/product-view.repository';

@Injectable()
@EventsHandler(InventoryUpdatedEvent)
export class InventoryUpdatedEventHandler implements IEventHandler<InventoryUpdatedEvent> {
  private readonly logger = new Logger(InventoryUpdatedEventHandler.name);

  constructor(
    private readonly productViewRepository: ProductViewRepository
  ) {}

  async handle(event: InventoryUpdatedEvent) {
    const { productId, quantity } = event.data;

    try {
      const updatedProduct = await this.productViewRepository.updateAvailableStock(
        productId,
        quantity
      );

      if (updatedProduct) {
        this.logger.log(`ProductView updated for product ${productId}: new availableStock is ${quantity}`);
      } else {
        this.logger.warn(`ProductView update failed for product ${productId}`);
      }
    } catch (error) {
      this.logger.error(`Error updating ProductView for product ${productId}:`, error.stack);
    }
  }
}