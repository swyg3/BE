import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";
import { SellerRegisteredEvent } from "../events/register-seller.event";

@EventsHandler(SellerRegisteredEvent)
export class SellerRegisteredHandler
  implements IEventHandler<SellerRegisteredEvent>
{
  private readonly logger = new Logger(SellerRegisteredHandler.name);

  constructor(private readonly sellerViewRepository: SellerViewRepository) {}

  async handle(event: SellerRegisteredEvent) {
    this.logger.log(`SellerRegisteredEvent 처리중: ${event.aggregateId}`);

    try {
      await this.sellerViewRepository.create({
          sellerId: event.aggregateId,
          email: event.data.email,
          name: event.data.name,
          phoneNumber: event.data.phoneNumber,
          storeName: event.data.storeName,
          storeAddress: event.data.storeAddress,
          storePhoneNumber: event.data.storePhoneNumber,
          isBusinessNumberVerified: event.data.isBusinessNumberVerified,
          isEmailVerified: event.data.isEmailVerified,
    });

      this.logger.log(`Sellers-View 업데이트 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `Sellers-View 업데이트 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}