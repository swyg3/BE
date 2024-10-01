import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { SellerDeletedEvent } from "../events/delete-seller.event";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@EventsHandler(SellerDeletedEvent)
export class SellerDeletedHandler implements IEventHandler<SellerDeletedEvent> {

  private readonly logger = new Logger(SellerDeletedHandler.name);
  
  constructor(private readonly sellerViewRepository: SellerViewRepository) {}

  async handle(event: SellerDeletedEvent) {

    this.logger.log(`SellerDeletedEvent 처리중: ${event.aggregateId}`);
    
    // DynamoDB 읽기 모델 업데이트
    await this.sellerViewRepository.delete(event.aggregateId);
  }
}
