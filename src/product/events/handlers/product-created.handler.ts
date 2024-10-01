import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ProductView, ProductViewRepository } from "../../repositories/product-view.repository";
import { ProductCreatedEvent } from "../impl/product-created.event";

@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler
  implements IEventHandler<ProductCreatedEvent> {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  constructor(
    private readonly productViewRepository: ProductViewRepository,
  ) {}

  async handle(event: ProductCreatedEvent) {
    this.logger.log(`ProductCreatedEvent 처리중: ${event.aggregateId}`);
    this.logger.log(`event handler ${event.data.productImageUrl}`);

    try {
      const productView: ProductView = {
        productId: event.aggregateId,
        sellerId: event.data.sellerId,
        category: event.data.category,
        name: event.data.name,
        productImageUrl: event.data.productImageUrl,
        description: event.data.description,
        originalPrice: Number(event.data.originalPrice),
        discountedPrice: Number(event.data.discountedPrice),
        discountRate: Number(event.data.discountRate),
        availableStock: Number(event.data.availableStock),
        expirationDate: new Date(event.data.expirationDate),
        createdAt: new Date(event.data.createdAt || Date.now()),
        updatedAt: new Date(event.data.updatedAt || Date.now()),
        locationX: event.data.locationX,
        locationY: event.data.locationY,
        distance: 0, // 초기 거리값은 0으로 설정
      };

      await this.productViewRepository.create(productView);

      this.logger.log(`ProductView 등록 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `ProductView 등록 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}