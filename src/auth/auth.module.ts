import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailModule } from 'src/shared/email-service/email.module';
import { HmacUtil } from 'src/shared/utils/hmac.util';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.config';
import { RequestEmailVerificationHandler } from './shared/commands/handlers/request-email-verify.handler';
import { VerifyEmailHandler } from './shared/commands/handlers/verify-email.handler';
import { EmailVerificationRequestedHandler } from './shared/events/handlers/email-verify-requested.handler';
import { EmailVerifiedHandler } from './shared/events/handlers/email-verified.handler';
import { UserAuthController } from './user-auth/user-auth.controller';
import { SellerAuthController } from './seller-auth/seller-auth.controller';
import { EmailVerificationService } from './shared/services/email-verification.service';
import { GoogleStrategy } from './shared/strategies/google.strategy';
import { KakaoStrategy } from './shared/strategies/kakao.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { AuthService } from './shared/services/auth.service';
import { TokenService } from './shared/services/token.service';
import { UserActivitiesModule } from 'src/user-activities/user-activity.module';
import { UsersModule } from 'src/users/users.module';
import { EventStoreModule } from 'src/shared/infrastructure/event-store/event-store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Seller } from 'src/sellers/entities/seller.entity';
import { LoginEmailCommandHandler } from './shared/commands/handlers/login-email.handler';
import { LoginOAuthCommandHandler } from './shared/commands/handlers/login-oauth.handler';
import { UserLoggedInEventHandler } from './shared/events/handlers/logged-in.handler';
import { EventBusService } from 'src/shared/infrastructure/cqrs/event-bus.service';
import { SellersModule } from 'src/sellers/sellers.module';


const CommandHandlers = [
  RequestEmailVerificationHandler, 
  VerifyEmailHandler,
  LoginEmailCommandHandler,
  LoginOAuthCommandHandler
];
const EventHandlers = [
  EmailVerificationRequestedHandler, 
  EmailVerifiedHandler,
  UserLoggedInEventHandler,
  ];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    TypeOrmModule.forFeature([User, Seller]),
    EmailModule,
    RedisModule,
    UsersModule,
    SellersModule,
    EventStoreModule,
    UserActivitiesModule
  ],
  controllers: [UserAuthController, SellerAuthController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    HmacUtil,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    AuthService,
    TokenService,
    EventBusService,
    EmailVerificationService,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}