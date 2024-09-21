import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { SellerProfileUpdatedEvent } from "../events/update-seller-profile.event";
import { SellerView, SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@EventsHandler(SellerProfileUpdatedEvent)
export class SellerProfileUpdatedHandler
  implements IEventHandler<SellerProfileUpdatedEvent>
{
  private readonly logger = new Logger(SellerProfileUpdatedHandler.name);

  constructor(private readonly sellerViewRepository: SellerViewRepository) {}

  async handle(event: SellerProfileUpdatedEvent) {
    this.logger.log(`SellerProfileUpdatedEvent 처리중: ${event.aggregateId}`);

    const updateData: Partial<SellerView> = {
      ...event.data,
    };

    const updatedSeller = await this.sellerViewRepository.update(event.aggregateId, updateData);

    this.logger.log(`Sellers-View 업데이트 성공: ${event.aggregateId} 변경 내용: ${updatedSeller}`);
  }
}
