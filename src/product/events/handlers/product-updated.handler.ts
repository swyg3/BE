import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ProductUpdatedEvent } from "../impl/product-updated.event";
import { ProductView, ProductViewRepository } from "src/product/repositories/product-view.repository";


@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedHandler
  implements IEventHandler<ProductUpdatedEvent>
{
  private readonly logger = new Logger(ProductUpdatedHandler.name);

  constructor(
    private readonly productViewRepository: ProductViewRepository,
  ) {}

  async handle(event: ProductUpdatedEvent) {
    this.logger.log(`ProductUpdatedEvent 처리중: ${event.aggregateId}`);

    const updateData: Partial<ProductView> = {
      ...event.data,
    };

    const updatedProduct = await this.productViewRepository.update(
      event.aggregateId,
      updateData,
    );

    if (updatedProduct) {
      this.logger.log(
        `ProductView 업데이트 성공: ${event.aggregateId} 변경 내용: ${JSON.stringify(updatedProduct)}`,
      );
    } else {
      this.logger.warn(
        `ProductView 업데이트 실패: ${event.aggregateId} - 해당 상품을 찾을 수 없습니다.`,
      );
    }
  }
}
