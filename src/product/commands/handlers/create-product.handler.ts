import { CreateProductCommand } from '../impl/create-product.command';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from 'src/product/entities/product.entity';
import { CreateInventoryCommand } from 'src/inventory/commands/impl/create-inventory.command'; // Import CreateInventoryCommand
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCreatedEvent } from 'src/product/events/impl/product-created.event';
import { Category } from 'src/product/product.category';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from 'src/shared/event-store/event-store.service';
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

    try {
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
      const id = savedProduct.id;

      const productAggregate = new ProductAggregate(id);
      const events = productAggregate.createProduct(
        sellerId,
        category,
        name,
        productImageUrl,
        description,
        originalPrice,
        discountedPrice,
      );

      // 이벤트 저장소에 저장
      for (const event of events) {
        await this.eventStoreService.saveEvent({
          aggregateId: id,
          aggregateType: 'Product',
          eventType: event.constructor.name,
          eventData: event,
          version: 1
        });
      }

      // Inventory 생성 명령어 발행
      const createInventoryCommand = new CreateInventoryCommand(
        id, quantity, expirationDate
      );
      const discountRate = ((originalPrice - discountedPrice) / originalPrice) * 100;
      await this.commandBus.execute(createInventoryCommand);

      // ProductCreatedEvent 생성
      const productRegisteredEvent = new ProductCreatedEvent(
        id,
        sellerId,
        category,
        name,
        productImageUrl,
        description,
        originalPrice,
        discountedPrice,
        discountRate,
        quantity,
        expirationDate,
        new Date(), // createdAt
        new Date()  // updatedAt
      );

      // 이벤트 버스에 이벤트 게시
      this.logger.log(`Publishing productRegisteredEvent for user: ${id}`);
      this.eventBus.publish(productRegisteredEvent);
      
    } catch (error) {
      // 에러 발생 시 이벤트 전체와 함께 에러 로그 출력
      this.logger.error(`Error occurred while executing CreateProductCommand: ${error.message}`);
      this.logger.error(`Event data: ${JSON.stringify(command)}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new BadRequestException('Error occurred during product creation process');
    }

    // 컨트롤러에 응답 반환
    return name;
  }
}
