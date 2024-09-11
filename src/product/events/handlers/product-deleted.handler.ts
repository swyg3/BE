import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductViewRepository } from '../../repositories/product-view.repository';
import { Logger } from '@nestjs/common';
import { ProductDeletedEvent } from '../impl/product-deleted.event';
import { InjectModel } from '@nestjs/mongoose';

@EventsHandler(ProductDeletedEvent)
export class ProductDeletedHandler implements IEventHandler<ProductDeletedEvent> {
  private readonly logger = new Logger(ProductDeletedHandler.name);

  constructor(
    private readonly productViewRepository: ProductViewRepository,

  ) { }

  async handle(event: ProductDeletedEvent) {
    const Id = event.Id;
    this.logger.log(`Handling ProductDeletedEvent for product: ${Id}`);


    // MongoDB에서 제품 삭제
    await this.productViewRepository.deleteProduct({ Id });



  }

}