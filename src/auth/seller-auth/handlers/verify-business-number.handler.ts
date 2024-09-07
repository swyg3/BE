import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyBusinessNumberCommand } from "../commands/verify-business-number.command";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { BusinessNumberVerificationService } from "../services/business-number-verification.service";
import { EventBusService } from "src/shared/infrastructure/cqrs/event-bus.service";
import { SellerAggregate } from "src/sellers/aggregates/seller.aggregate";

@CommandHandler(VerifyBusinessNumberCommand)
export class VerifyBusinessNumberHandler
  implements ICommandHandler<VerifyBusinessNumberCommand>
{
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: VerifyBusinessNumberCommand) {
    const { sellerId, businessNumber } = command;

    // 판매자 조회
    const seller = await this.sellerRepository.findBySellerId(sellerId);
    if (!seller) {
      return { success: false, message: "판매자를 찾을 수 없습니다." };
    }

    // 사업자 등록번호 유효성 검증
    const isValid =
      await this.businessNumberVerificationService.verify(businessNumber);
    if (!isValid) {
      return {
        success: false,
        message: "유효하지 않은 사업자 등록번호입니다.",
      };
    }

    // SellerAggregate 생성 및 사업자 등록번호 인증 처리
    const sellerAggregate = new SellerAggregate(sellerId);
    const events = sellerAggregate.verifyBusinessNumber();

    // 이벤트 발행 및 저장
    for (const event of events) {
      await this.eventBusService.publishAndSave(event);
    }

    // 판매자 엔티티 업데이트
    seller.isBusinessNumberVerified = true;
    await this.sellerRepository.save(seller);

    return {
      success: true,
      message: "사업자 등록번호가 인증되었습니다.",
      data: { isVerified: true },
    };
  }
}
