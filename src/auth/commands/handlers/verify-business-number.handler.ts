import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { VerifyBusinessNumberCommand } from "../commands/verify-business-number.command";
import { BusinessNumberVerificationService } from "../../services/business-number-verification.service";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";

@CommandHandler(VerifyBusinessNumberCommand)
export class VerifyBusinessNumberHandler
  implements ICommandHandler<VerifyBusinessNumberCommand>
{
  constructor(
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: VerifyBusinessNumberCommand) {
    const { email, businessNumber } = command;

    // 사업자 등록번호 유효성 검증
    const isValid =
      await this.businessNumberVerificationService.verify(businessNumber);
    if (!isValid) {
      return {
        success: false,
        message: "유효하지 않은 사업자 등록번호입니다.",
      };
    }

    // Redis에 인증 상태 저장
    await this.redisClient.set(
      `business_number_verified:${email}`,
      "true",
      "EX",
      3600,
    );

    return {
      success: true,
      message: "유효한 사업자 등록번호입니다.",
      data: { isVerified: true },
    };
  }
}
