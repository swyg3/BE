import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SellerProfileCompletedEvent } from "../events/seller-profile-completed.event";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { CompleteSellerProfileCommand } from "../../commands/commands/complete-seller-profile.command";

@CommandHandler(CompleteSellerProfileCommand)
export class CompleteSellerProfileHandler
  implements ICommandHandler<CompleteSellerProfileCommand>
{
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: CompleteSellerProfileCommand) {
    const { sellerId, profileData } = command;

    const seller = await this.sellerRepository.findBySellerId(sellerId);
    if (!seller) {
      return { success: false, message: "판매자를 찾을 수 없습니다." };
    }

    // 프로필 정보 업데이트
    seller.storeName = profileData.storeName;
    seller.storeAddress = profileData.storeAddress;
    seller.storePhoneNumber = profileData.storePhoneNumber;

    await this.sellerRepository.save(seller);

    // 이벤트 발행 및 저장
    const event = new SellerProfileCompletedEvent(sellerId, profileData, 1);
    await this.eventBusService.publishAndSave(event);

    return {
      success: true,
      message: "판매자 프로필이 완성되었습니다.",
      data: seller,
    };
  }
}