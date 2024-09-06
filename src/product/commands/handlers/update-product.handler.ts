// src/product/commands/handlers/update-product.handler.ts
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from '../../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { Logger, Inject } from '@nestjs/common';
import { EventStoreService } from 'src/shared/event-store/event-store.service';
import { ProductUpdatedEvent } from 'src/product/events/impl/product-updated.event';
import { UpdateProductCommand } from '../impl/update-product.command';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  private readonly logger = new Logger(UpdateProductHandler.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventStoreService: EventStoreService,
    @Inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const { Id, updates } = command;

    const product = await this.productRepository.findOne({ where: { Id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${Id} not found`);
    }
    //db 저장

    if (updates.name) product.name = updates.name;
    if (updates.productImageUrl) product.productImageUrl = updates.productImageUrl;
    if (updates.description) product.description = updates.description;
    if (updates.originalPrice) product.originalPrice = updates.originalPrice;
    if (updates.discountedPrice) product.discountedPrice = updates.discountedPrice;


    await this.productRepository.save(product);

    this.logger.log(`Product with ID ${Id} has been updated`);


    // 이벤트 생성
    const productUpdatedEvent = new ProductUpdatedEvent(
        Id,
        updates.name,
        updates.productImageUrl,
        updates.description,
        updates.originalPrice,
        updates.discountedPrice
      );
  
      // 이벤트 저장
      await this.eventStoreService.saveEvent({
        aggregateId: Id.toString(),
        aggregateType: 'Product',
        eventType: productUpdatedEvent.constructor.name,
        eventData: productUpdatedEvent,
        version: 1 
      });
  

      this.logger.log(`ProductUpdatedEvent for product ID ${Id} saved`);

   
    return product;
  }
}
