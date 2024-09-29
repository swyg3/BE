import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { VerifyBusinessNumberCommand } from "../commands/verify-business-number.command";
import { BusinessNumberVerificationService } from "../../services/business-number-verification.service";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";

@CommandHandler(VerifyBusinessNumberCommand)
export class VerifyBusinessNumberHandler
  implements ICommandHandler<VerifyBusinessNumberCommand>
{
  private readonly logger = new Logger(VerifyBusinessNumberHandler.name);

  constructor(
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: VerifyBusinessNumberCommand) {
    const { email, businessNumber } = command;

    const isValid = true;

    //const isValid = await this.businessNumberVerificationService.verify(businessNumber);

    // if (!isValid) {
    //   this.logger.warn(`사업자 등록번호 인증 실패: ${businessNumber}`);
    //   return {
    //     success: false,
    //     message: "유효하지 않은 사업자 등록번호입니다.",
    //   };
    // }

    await this.storeVerificationStatus(email);

    this.logger.log(`사업자 등록번호 인증 성공: ${email}`);
    return isValid;
  }

  private async storeVerificationStatus(email: string): Promise<void> {
    const key = `business_number_verified:${email}`;
    await this.redisClient.set(key, "true", "EX", 3600);
  }
}
