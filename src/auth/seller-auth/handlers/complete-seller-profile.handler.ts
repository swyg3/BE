import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CompleteSellerProfileCommand } from '../commands/complete-seller-profile.command';
import { SellerProfileCompletedEvent } from '../events/seller-profile-completed.event';
import { SellerRepository } from 'src/sellers/repositories/seller.repository';

@CommandHandler(CompleteSellerProfileCommand)
export class CompleteSellerProfileHandler implements ICommandHandler<CompleteSellerProfileCommand> {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CompleteSellerProfileCommand) {
    const { sellerId, profileData } = command;
    
    const seller = await this.sellerRepository.findBySellerId(sellerId);
    if (!seller) {
      return { success: false, message: '판매자를 찾을 수 없습니다.' };
    }

    // 프로필 정보 업데이트
    seller.storeName = profileData.storeName;
    seller.storeAddress = profileData.storeAddress;
    seller.storePhoneNumber = profileData.storePhoneNumber;

    await this.sellerRepository.save(seller);

    // 이벤트 발행
    this.eventBus.publish(new SellerProfileCompletedEvent(sellerId, profileData));

    return {
      success: true,
      message: '판매자 프로필이 완성되었습니다.',
      data: seller
    };
  }
}