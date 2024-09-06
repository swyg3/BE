import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductViewRepository } from '../../repositories/product-view.repository';
import { Logger } from '@nestjs/common';
import { ProductCreatedEvent } from '../impl/product-created.event';
import { ProductDeletedEvent } from '../impl/product-deleted.event';

@EventsHandler(ProductDeletedEvent)
export class ProductDeletedHandler implements IEventHandler<ProductDeletedEvent> {
  private readonly logger = new Logger(ProductDeletedHandler.name);

  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async handle(event: ProductDeletedEvent) {
    this.logger.log(`Handling ProductDeletedEvent for product: ${event.Id}`);

    try {
      await this.productViewRepository.deletedProduct({
        Id: event.Id,
      });

      this.logger.log(`Product view successfully deleted: ${event.Id}`);
    } catch (error) {
      this.logger.error(`Failed to delete product view: ${event.Id}, ${error.message}`, error.stack);
    }
  }
}
