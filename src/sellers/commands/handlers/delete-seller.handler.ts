import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteSellerCommand } from "../commands/delete-seller.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Logger } from "@nestjs/common";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { SellerDeletedEvent } from "src/sellers/events/events/delete-seller.event";

@CommandHandler(DeleteSellerCommand)
export class DeleteSellerHandler implements ICommandHandler<DeleteSellerCommand> {

  private readonly logger = new Logger(DeleteSellerHandler.name);


  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: DeleteSellerCommand) {
    const { sellerId } = command;

    this.logger.log(`회원탈퇴 SoftDelete 시도: ${sellerId}`);

     // PostgreSQL에서 soft delete 수행
     await this.sellerRepository.softDelete(sellerId);
     this.logger.log(`회원탈퇴 SoftDelete 처리 완료: ${sellerId}`);
 
     // 이벤트 생성, 저장 및 발행
     const sellerDeletedEvent = new SellerDeletedEvent(sellerId, {}, 1)
     await this.eventBusService.publishAndSave(sellerDeletedEvent);
     this.logger.log(`회원탈퇴 SoftDelete 이벤트 발행: ${sellerId}`);
   }
}
