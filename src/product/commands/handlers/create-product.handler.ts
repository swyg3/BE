import { CreateProductCommand } from '../impl/create-product.command';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from 'src/product/entities/product.entity';
import { CreateInventoryCommand } from 'src/inventory/commands/impl/create-inventory.command'; // Import CreateInventoryCommand
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCreatedEvent } from 'src/product/events/impl/product-created.event';
import { Category } from 'src/product/product.category';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
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
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(CommandBus) private readonly commandBus: CommandBus
  ) { }

  async execute(command: CreateProductCommand) {
    const { sellerId, category, name, productImageUrl, description, originalPrice, discountedPrice, quantity, expirationDate } = command;

     // Product 저장
     const product = this.productRepository.create({
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
    });
    const savedProduct = await this.productRepository.save(product);

    const Id = savedProduct.Id;

    const productAggregate = new ProductAggregate(Id);
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
        aggregateId: Id,
        aggregateType: 'Product',
        eventType: event.constructor.name,
        eventData: event,
        version: 1
      });
      console.log("event success");
    }


    console.log("db success");

   

    // Inventory 생성 명령어 발행
    const createInventoryCommand = new CreateInventoryCommand(
      Id, quantity, expirationDate
    );
    const discountRate = ((originalPrice - discountedPrice) / originalPrice) * 100;
    await this.commandBus.execute(createInventoryCommand);

    console.log("Inventorycommand success");

    const productRegisteredEvent = new ProductCreatedEvent(
      Id,
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
      discountRate,              
      quantity,            
      expirationDate, // 만기일을 설정한 날짜로 지정
      new Date(),     // createdAt, 현재 날짜
      new Date()      // updatedAt, 현재 날짜
    );

    this.logger.log(`Publishing productRegisteredEvent for user: ${name}`);
    this.eventBus.publish(productRegisteredEvent);

    // 컨트롤러에 응답 반환
    return Id;
  }
}
