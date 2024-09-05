import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { EmailModule } from 'src/shared/email-service/email.module';
import { HmacUtil } from 'src/shared/utils/hmac.util';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.config';
import { RequestEmailVerificationHandler } from './commands/handlers/request-email-verify.handler';
import { VerifyEmailHandler } from './commands/handlers/verify-email.handler';
import { EmailVerificationRequestedHandler } from './events/handlers/email-verify-requested.handler';
import { EmailVerifiedHandler } from './events/handlers/email-verified.handler';

const CommandHandlers = [RequestEmailVerificationHandler, VerifyEmailHandler];
const QueryHandlers = [];
const EventHandlers = [EmailVerificationRequestedHandler, EmailVerifiedHandler];

@Module({
  imports: [
    CqrsModule,
    EmailModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    HmacUtil,
  ],
})
export class AuthModule {}