import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { RequestEmailVerificationCommand } from '../commands/request-email-verify.command';
import { EmailService } from 'src/shared/email-service/email.service';
import { HmacUtil } from 'src/shared/utils/hmac.util';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationRequestedEvent } from 'src/auth/shared/events/events/email-verify-requested.event';

@CommandHandler(RequestEmailVerificationCommand)
export class RequestEmailVerificationHandler implements ICommandHandler<RequestEmailVerificationCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly emailService: EmailService,
    private readonly hmacUtil: HmacUtil,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService
  ) {}

  async execute(command: RequestEmailVerificationCommand) {
    const { email } = command;
    const verificationCode = this.generateVerificationCode();
    const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3분 만료

    // HMAC 서명 생성
    const signature = this.hmacUtil.sign(email, verificationCode, expirationTime);

    // Redis 캐싱
    await this.redisClient.set(
      `email_verification:${email}`,
      JSON.stringify({ verificationCode, signature, expirationTime }),
      'EX',
      180
    );

    // 인증코드 메일 발송
    await this.emailService.sendVerificationEmail(email, verificationCode);

    // 이벤트 발행
    this.eventBus.publish(new EmailVerificationRequestedEvent(email, verificationCode, expirationTime));

    return true;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자
  }
}