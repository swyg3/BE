import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ProductDeletedEvent } from "../impl/product-deleted.event";
import { ProductViewRepository } from "../../repositories/product-view.repository";

@EventsHandler(ProductDeletedEvent)
export class ProductDeletedHandler
  implements IEventHandler<ProductDeletedEvent>
{
  private readonly logger = new Logger(ProductDeletedHandler.name);

  constructor(
    private readonly dyProductViewRepository: ProductViewRepository,
  ) {}

  async handle(event: ProductDeletedEvent) {
    const productId = event.aggregateId;
    try {
      this.logger.log(`ProductDeletedEvent 처리중: ${productId}`);

      await this.dyProductViewRepository.delete({ productId });

      this.logger.log(`ProductView 삭제 성공: ${productId}`);
    } catch (error) {
      this.logger.error(
        `ProductView 삭제 실패: ${productId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
