import {
  Logger,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import { PasswordService } from "src/users/services/password.service";
import { Repository } from "typeorm";
import { RegisterSellerCommand } from "../commands/register-seller.command";
import { Seller } from "src/sellers/entities/seller.entity";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

import { v4 as uuidv4 } from "uuid";
import { SellerRegisteredEvent } from "src/sellers/events/events/register-seller.event";

@CommandHandler(RegisterSellerCommand)
export class RegisterSellerHandler
  implements ICommandHandler<RegisterSellerCommand>
{
  private readonly logger = new Logger(RegisterSellerHandler.name);

  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly passwordService: PasswordService,
    private readonly eventBusService: EventBusService,
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
    } = command;

    // 이메일 인증 상태 확인
    const isEmailVerified = await this.redisClient.get(
      `email_verified:${email}`,
    );
    if (isEmailVerified !== "true") {
      throw new UnauthorizedException("이메일 인증이 완료되지 않았습니다.");
    }

    // 비밀번호 확인
    if (password !== pwConfirm) {
      throw new BadRequestException(
        "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      );
    }

    // 중복 이메일 검증
    const existingSeller = await this.sellerRepository.findOne({
      where: { email },
    });
    if (existingSeller) {
      throw new BadRequestException("이미 가입한 이메일입니다.");
    }

    const sellerId = uuidv4();
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 판매자 엔티티 생성 및 저장
    const seller = this.sellerRepository.create({
      id: sellerId,
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      storeName,
      storeAddress,
      storePhoneNumber,
    });
    await this.sellerRepository.save(seller);

    // 이벤트 생성 및 발행
    const sellerRegisteredEvent = new SellerRegisteredEvent(
      sellerId,
      {
        email,
        name,
        phoneNumber,
        storeName,
        storeAddress,
        storePhoneNumber,
        isEmailVerified: true,
      },
      1,
    );

    await this.eventBusService.publishAndSave(sellerRegisteredEvent);

    // Redis에서 이메일 인증 상태 삭제
    await this.redisClient.del(`email_verified:${email}`);

    this.logger.log(`판매자 등록 완료: ${sellerId}`);
    return sellerId;
  }
}
