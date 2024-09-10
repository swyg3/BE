import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { SellerProfileUpdatedEvent } from "../events/update-seller-profile.event";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@EventsHandler(SellerProfileUpdatedEvent)
export class SellerProfileUpdatedHandler
  implements IEventHandler<SellerProfileUpdatedEvent>
{
  private readonly logger = new Logger(SellerProfileUpdatedHandler.name);

  constructor(private readonly sellerViewRepository: SellerViewRepository) {}

  async handle(event: SellerProfileUpdatedEvent) {

    /**
     * TODO: 읽기 모델 업데이트 처리
     */
  }
}
