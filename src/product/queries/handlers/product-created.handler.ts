import { Injectable } from '@nestjs/common';
import { ProductCreatedEvent } from '../../events/impl/product-created.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@Injectable()
@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler implements IEventHandler<ProductCreatedEvent> {
  async handle(event: ProductCreatedEvent): Promise<void> {
    console.log('Product Created Event:', event);
    // 필요한 후속 작업을 여기에 정의합니다.
  }
}
