import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { VerifyBusinessNumberCommand } from '../commands/verify-business-number.command';
import { BusinessNumberVerificationService } from '../services/business-number-verification.service';
import { BusinessNumberVerifiedEvent } from '../events/business-number-verified.event';
import { SellerRepository } from 'src/sellers/repositories/seller.repository';


@CommandHandler(VerifyBusinessNumberCommand)
export class VerifyBusinessNumberHandler implements ICommandHandler<VerifyBusinessNumberCommand> {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: VerifyBusinessNumberCommand) {
    const { sellerId, businessNumber } = command;
    
    const seller = await this.sellerRepository.findBySellerId(sellerId);
    if (!seller) {
      return { success: false, message: '판매자를 찾을 수 없습니다.' };
    }

    const isValid = await this.businessNumberVerificationService.verify(businessNumber);
    if (!isValid) {
      return { success: false, message: '유효하지 않은 사업자 등록번호입니다.' };
    }

    seller.isBusinessNumberVerified = true;
    await this.sellerRepository.save(seller);

    // 이벤트 발행
    this.eventBus.publish(new BusinessNumberVerifiedEvent(sellerId, businessNumber));

    return {
      success: true,
      message: '사업자 등록번호가 인증되었습니다.',
      data: { isVerified: true }
    };
  }
}