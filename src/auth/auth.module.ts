import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as SharedCommandHandlers from "./shared/commands/handlers";
import * as SharedEventHandlers from "./shared/events/handlers";
import { User } from "src/users/entities/user.entity";
import { Seller } from "src/sellers/entities/seller.entity";
import { EmailModule } from "src/shared/email-service/email.module";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { UsersModule } from "src/users/users.module";
import { SellersModule } from "src/sellers/sellers.module";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing/event-sourcing.module";
import { UserActivitiesModule } from "src/user-activities/user-activity.module";
import { SellerAuthModule } from "./seller-auth/seller-auth.module";
import { UserAuthController } from "./user-auth/user-auth.controller";
import { HmacUtil } from "src/shared/utils/hmac.util";
import { JwtStrategy } from "./shared/strategies/jwt.strategy";
import { GoogleStrategy } from "./shared/strategies/google.strategy";
import { KakaoStrategy } from "./shared/strategies/kakao.strategy";
import { AuthService } from "./shared/services/auth.service";
import { TokenService } from "./shared/services/token.service";
import { EmailVerificationService } from "./shared/services/email-verification.service";
import { TokenBlacklistService } from "./shared/services/token-blacklist.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    TypeOrmModule.forFeature([User, Seller]),
    EmailModule,
    RedisModule,
    UsersModule,
    SellersModule,
    EventSourcingModule,
    UserActivitiesModule,
    SellerAuthModule,
  ],
  controllers: [UserAuthController],
  providers: [
    HmacUtil,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    AuthService,
    TokenService,
    EmailVerificationService,
    TokenBlacklistService,
    ...Object.values(SharedCommandHandlers),
    ...Object.values(SharedEventHandlers),
  ],
  exports: [AuthService, TokenService, EmailVerificationService],
})
export class AuthModule {}
