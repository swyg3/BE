import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { SellerRegisteredEvent } from "../events/register-seller.event";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

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
        isEmailVerified: event.data.isEmailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.logger.log(`Sellers-View 업데이트 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `---Sellers-View 업데이트 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }

  }
}
