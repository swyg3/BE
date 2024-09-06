import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BusinessNumberVerifiedEvent } from '../events/business-number-verified.event';
import { SellerRepository } from 'src/sellers/seller.repository';

@EventsHandler(BusinessNumberVerifiedEvent)
export class BusinessNumberVerifiedEventHandler implements IEventHandler<BusinessNumberVerifiedEvent> {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async handle(event: BusinessNumberVerifiedEvent) {
    const { sellerId, businessNumber } = event;
    
    // 여기서 추가적인 작업을 수행할 수 있습니다.
    // 예: 판매자 상태 업데이트, 알림 발송 등
    
    console.log(`사업자 등록번호가 인증되었습니다. 판매자 ID: ${sellerId}, 사업자 등록번호: ${businessNumber}`);
    
    // 판매자 정보 업데이트 (예시)
    await this.sellerRepository.updateBusinessNumberVerification(sellerId, businessNumber, true);
  }
}