import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyBusinessNumberCommand } from "../commands/verify-business-number.command";
import { BusinessNumberVerificationService } from "../../services/business-number-verification.service";


@CommandHandler(VerifyBusinessNumberCommand)
export class VerifyBusinessNumberHandler
  implements ICommandHandler<VerifyBusinessNumberCommand>
{
  constructor(
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
  ) {}

  async execute(command: VerifyBusinessNumberCommand) {
    const { businessNumber } = command;

    // 사업자 등록번호 유효성 검증
    const isValid =
      await this.businessNumberVerificationService.verify(businessNumber);
    if (!isValid) {
      return {
        success: false,
        message: "유효하지 않은 사업자 등록번호입니다.",
      };
    }

    return {
      success: true,
      message: "유효한 사업자 등록번호입니다.",
      data: { isVerified: true, businessNumber },
    };
  }
}
