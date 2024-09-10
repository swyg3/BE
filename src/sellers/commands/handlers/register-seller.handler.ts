import { Logger, Inject, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import { RegisterSellerCommand } from "../commands/register-seller.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { v4 as uuidv4 } from "uuid";
import { SellerRegisteredEvent } from "src/sellers/events/events/register-seller.event";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { BusinessNumberVerificationService } from "src/auth/services/business-number-verification.service";
import { PasswordService } from "src/shared/services/password.service";

@CommandHandler(RegisterSellerCommand)
export class RegisterSellerHandler implements ICommandHandler<RegisterSellerCommand> {
  private readonly logger = new Logger(RegisterSellerHandler.name);

  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBusService: EventBusService,
    private readonly businessNumberVerificationService: BusinessNumberVerificationService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: RegisterSellerCommand): Promise<string> {
    const {
      email,
      password,
      pwConfirm,
      name,
      phoneNumber,
      storeName,
      storeAddress,
      storePhoneNumber,
      businessNumber,
    } = command;

    // 이메일 인증 상태 확인
    const isEmailVerified = await this.redisClient.get(`email_verified:${email}`);
    if (isEmailVerified !== "true") {
      throw new UnauthorizedException("이메일 인증이 완료되지 않았습니다.");
    }

    // 비밀번호 확인
    if (password !== pwConfirm) {
      throw new BadRequestException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }

    // 사업자 번호 검증
    const isBusinessVerified = await this.businessNumberVerificationService.verify(businessNumber);

    const sellerId = uuidv4();
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 판매자 생성 또는 업데이트
    const { seller, isNewSeller } = await this.sellerRepository.upsert(email, {
      id: sellerId,
      password: hashedPassword,
      name,
      phoneNumber,
      storeName,
      storeAddress,
      storePhoneNumber,
      isEmailVerified: true,
      isBusinessNumberVerified: isBusinessVerified,
    });

    if (!isNewSeller) {
      throw new BadRequestException("이미 가입한 이메일입니다.");
    }

    // 이벤트 생성 및 발행
    const sellerRegisteredEvent = new SellerRegisteredEvent(
      seller.id,
      {
        email: seller.email,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        storeName: seller.storeName,
        storeAddress: seller.storeAddress,
        storePhoneNumber: seller.storePhoneNumber,
        isEmailVerified: seller.isEmailVerified,
        isBusinessNumberVerified: seller.isBusinessNumberVerified,
      },
      1,
    );

    await this.eventBusService.publishAndSave(sellerRegisteredEvent);

    // Redis에서 이메일 인증 상태 삭제
    await this.redisClient.del(`email_verified:${email}`);

    this.logger.log(`판매자 등록 완료: ${seller.id}`);
    return seller.id;
  }
}