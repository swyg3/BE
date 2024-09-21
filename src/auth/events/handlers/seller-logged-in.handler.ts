import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SellerLoggedInEvent } from "../events/seller-logged-in.event";
import { Logger } from "@nestjs/common";
import { DySellerViewRepository } from "src/sellers/repositories/dy-seller-view.repository";

@EventsHandler(SellerLoggedInEvent)
export class SellerLoggedInEventHandler
  implements IEventHandler<SellerLoggedInEvent>
{
  private readonly logger = new Logger(SellerLoggedInEventHandler.name);

  constructor(
    private dySellerViewRepository: DySellerViewRepository,
  ) {}

  async handle(event: SellerLoggedInEvent) {
    this.logger.log(`판매자 로그인 이벤트 처리: sellerId=${event.aggregateId}`);

    // DynamoDB에서 로그인 시간 업데이트
      const updatedSeller = await this.dySellerViewRepository.update(event.aggregateId, {
        lastLoginAt: new Date()
      });
      
      this.logger.log(`로그인 이벤트 처리 완료: sellerId=${event.aggregateId}, 마지막 로그인 시간: ${updatedSeller.lastLoginAt}`);
    }
}