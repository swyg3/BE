import { CreateProductCommand } from '../impl/create-product.command';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from 'src/product/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCreatedEvent } from 'src/product/events/impl/product-created.event';
import { Category } from 'src/product/product.category';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from 'src/shared/event-store/event-store.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { ProductAggregate } from 'src/product/aggregates/product.aggregate';
import { Repository } from 'typeorm';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly eventStoreService: EventStoreService,
    @Inject(EventBus) private readonly eventBus: EventBus
    //private productRepository: Repository<Product>,
  ) { }

  async execute(command: CreateProductCommand) {
    const { sellerId, category, name, productImageUrl, description, originalPrice, discountedPrice } = command;

    const productId = uuidv4(); // Generate a unique ID
    const expirationDate = new Date();


    const productAggregate = new ProductAggregate(productId);
    const events = productAggregate.createProduct(
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,

    );
    console.log("command success");
    // 이벤트 저장소에 저장
    for (const event of events) {
      await this.eventStoreService.saveEvent({
        aggregateId: productId,
        aggregateType: 'Product',
        eventType: event.constructor.name,
        eventData: event,
        version: 1
      });
      console.log("event success");
    }
    //db에 저장 
    const product = this.productRepository.create({
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    });
    await this.productRepository.save(product);

    console.log("db success");
    const postRegisteredEvent = new ProductCreatedEvent(
      productId,
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
      0,              // discountRate, 기본값으로 설정
      0,              // availableStock, 기본값으로 설정
      expirationDate, // 만기일을 설정한 날짜로 지정
      new Date(),     // createdAt, 현재 날짜
      new Date()      // updatedAt, 현재 날짜
    );
    this.logger.log(`Publishing postRegisteredEvent for user: ${name}`);
    this.eventBus.publish(postRegisteredEvent);

    // 컨트롤러에 응답 반환
    return productId;

  }
}


