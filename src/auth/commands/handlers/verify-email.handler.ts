import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';
import { VerifyEmailCommand } from '../commands/verify-email.command';
import { HmacUtil } from 'src/shared/utils/hmac.util';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import { EmailVerifiedEvent } from 'src/auth/events/events/email-verified.event';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly hmacUtil: HmacUtil,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: VerifyEmailCommand) {
    const { email, verificationCode } = command;

    // Redis에서 인증코드 조회
    const storedData = await this.redisClient.get(`email_verification:${email}`);
    if (!storedData) {
      throw new UnauthorizedException('인증코드를 확인할 수 없습니다.');
    }

    const { verificationCode: storedCode, signature, expirationTime } = JSON.parse(storedData);

    // 인증코드 만료 검증
    if (new Date() > new Date(expirationTime)) {
      throw new UnauthorizedException('만료된 인증코드입니다. 다시 시도해주세요.');
    }

    // 인종크도 일치 여부 검증
    if (verificationCode !== storedCode || !this.hmacUtil.verify(email, verificationCode, new Date(expirationTime), signature)) {
      throw new UnauthorizedException('유효하지 않은 인증코드입니다. 다시 확인해주세요.');
    }

    // Redis 캐싱 무효화
    await this.redisClient.del(`email_verification:${email}`);

    // 인증 완료 상태를 Redis에 저장
    await this.redisClient.set(`email_verified:${email}`, 'true', 'EX', 86400); // 24시간 동안 유효

    // 이벤트 발행
    this.eventBus.publish(new EmailVerifiedEvent(email));

    return true;
  }
}