import {
  Logger,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import { RegisterSellerCommand } from "../commands/register-seller.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { v4 as uuidv4 } from "uuid";
import { SellerRegisteredEvent } from "src/sellers/events/events/register-seller.event";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { PasswordService } from "src/shared/services/password.service";
import { Seller } from "src/sellers/entities/seller.entity";

@CommandHandler(RegisterSellerCommand)
export class RegisterSellerHandler
  implements ICommandHandler<RegisterSellerCommand>
{
  private readonly logger = new Logger(RegisterSellerHandler.name);

  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBusService: EventBusService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: RegisterSellerCommand): Promise<string> {
    const { email, password, pwConfirm, name, phoneNumber } =
      command.registerSellerDto;

    this.logger.log(`판매자 등록 시도: ${email}`);

    // 이메일 및 사업자 등록번호 인증 상태 확인
    await this.validateVerificationStatus(email);

    // 추가 매장 정보 가져오기
    const additionalInfo = await this.getAdditionalInfo(email);

    // 비밀번호 확인
    this.validatePassword(password, pwConfirm);

    // 중복 가입 확인
    await this.checkExistingSeller(email);

    // 판매자 생성 또는 업데이트
    const hashedPassword = await this.passwordService.hashPassword(password);
    const sellerId = uuidv4();
    const seller = await this.createSeller(
      sellerId,
      email,
      hashedPassword,
      name,
      phoneNumber,
      additionalInfo,
    );
    await this.publishSellerRegisteredEvent(seller);
    await this.cleanupRedisData(email);

    this.logger.log(`판매자 등록 완료: ${seller.id}`);
    return seller.id;
  }

  private async validateVerificationStatus(email: string): Promise<void> {
    const [emailVerified, businessNumberVerified] = await Promise.all([
      this.redisClient.get(`email_verified:${email}`),
      this.redisClient.get(`business_number_verified:${email}`),
    ]);

    if (emailVerified !== "true") {
      throw new UnauthorizedException("이메일 인증이 완료되지 않았습니다.");
    }
    if (businessNumberVerified !== "true") {
      throw new UnauthorizedException(
        "사업자 등록번호 인증이 완료되지 않았습니다.",
      );
    }
  }

  private async getAdditionalInfo(email: string): Promise<any> {
    const additionalInfo = await this.redisClient.hgetall(
      `seller_profile:${email}`,
    );
    if (!additionalInfo) {
      throw new BadRequestException("추가 정보가 입력되지 않았습니다.");
    }
    return additionalInfo;
  }

  private validatePassword(password: string, pwConfirm: string): void {
    if (password !== pwConfirm) {
      throw new BadRequestException(
        "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      );
    }
  }

  private async checkExistingSeller(email: string): Promise<void> {
    const existingUser = await this.sellerRepository.findByEmailIncludingDeleted(email);
    if (existingUser) {
      if (existingUser.isDeleted) {
        throw new BadRequestException(
          "이전에 탈퇴한 계정입니다. [마이 페이지]에서 가입한 계정을 재활성화해주세요."
        );
      } else {
        throw new BadRequestException("이미 가입한 이메일입니다.");
      }
    }
  }

  private async createSeller(
    sellerId: string,
    email: string,
    hashedPassword: string,
    name: string,
    phoneNumber: string,
    additionalInfo: any,
  ): Promise<Seller> {
    const newSeller = this.sellerRepository.create({
      id: sellerId,
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      ...additionalInfo,
      isEmailVerified: true,
      isBusinessNumberVerified: true,
    });
    return this.sellerRepository.save(newSeller);
  }

  private async publishSellerRegisteredEvent(seller: Seller): Promise<void> {
    const sellerRegisteredEvent = new SellerRegisteredEvent(
      seller.id,
      {
        email: seller.email,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        storeName: seller.storeName,
        storeAddress: seller.storeAddress,
        storePhoneNumber: seller.storePhoneNumber,
        isEmailVerified: true,
        isBusinessNumberVerified: true,
      },
      1,
    );

    await this.eventBusService.publishAndSave(sellerRegisteredEvent);
    this.logger.log(`판매자 등록 이벤트 발행: ${seller.id}`);
  }

  private async cleanupRedisData(email: string): Promise<void> {
    await Promise.all([
      this.redisClient.del(`email_verified:${email}`),
      this.redisClient.del(`business_number_verified:${email}`),
      this.redisClient.del(`seller_profile:${email}`),
    ]);
  }
}
