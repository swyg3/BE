import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as CommandHandlers from "./commands/handlers";
import * as EventHandlers from "./events/handlers";
import { User } from "src/users/entities/user.entity";
import { Seller } from "src/sellers/entities/seller.entity";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { KakaoStrategy } from "./strategies/kakao.strategy";
import { TokenService } from "./services/token.service";
import { EmailVerificationService } from "./services/email-verification.service";
import { RefreshTokenService } from "./services/refresh-token.service";
import { BusinessNumberVerificationService } from "./services/business-number-verification.service";
import { UsersModule } from "src/users/users.module";
import { SellersModule } from "src/sellers/sellers.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { EmailModule } from "src/shared/email-service/email.module";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { PasswordService } from "src/shared/services/password.service";
import { HmacUtil } from "src/shared/utils/hmac.util";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("ACCESS_TOKEN_EXPIRY"),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Seller]),
    RedisModule,
    EmailModule,
    EventSourcingModule,
    UsersModule,
    SellersModule,
  ],
  controllers: [AuthController],
  providers: [
    ...Object.values(CommandHandlers),
    ...Object.values(EventHandlers),
    JwtStrategy,
    JwtAuthGuard,
    GoogleStrategy,
    KakaoStrategy,
    TokenService,
    RefreshTokenService,
    EmailVerificationService,
    BusinessNumberVerificationService,
    PasswordService,
    HmacUtil,
  ],
  exports: [
    JwtStrategy,
    JwtAuthGuard,
    EmailVerificationService,
    BusinessNumberVerificationService,
    PasswordService,
  ],
})
export class AuthModule {}
