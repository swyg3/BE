import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as CommandHandlers from "./commands/handlers";
import * as EventHandlers from "./events/handlers";
import { User } from "src/users/entities/user.entity";
import { Seller } from "src/sellers/entities/seller.entity";
import { SharedModule } from "src/shared/shared.module";
import { UsersModule } from "src/users/users.module";
import { SellersModule } from "src/sellers/sellers.module";
import { UserActivitiesModule } from "src/user-activities/user-activity.module";
import { AuthController } from "./auth.controller";
import { HmacUtil } from "src/shared/utils/hmac.util";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { KakaoStrategy } from "./strategies/kakao.strategy";
import { TokenService } from "./services/token.service";
import { EmailVerificationService } from "./services/email-verification.service";
import { RefreshTokenService } from "./services/refresh-token.service";
import { BusinessNumberVerificationService } from "./services/business-number-verification.service";

@Module({
  imports: [
    SharedModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    TypeOrmModule.forFeature([User, Seller]),
    forwardRef(() => UsersModule),
    forwardRef(() => SellersModule),
    UserActivitiesModule,
  ],
  controllers: [AuthController],
  providers: [
    ...Object.values(CommandHandlers),
    ...Object.values(EventHandlers),
    HmacUtil,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    TokenService,
    EmailVerificationService,
    RefreshTokenService,
    BusinessNumberVerificationService
  ],
  exports: [TokenService, RefreshTokenService, EmailVerificationService, BusinessNumberVerificationService],
})
export class AuthModule {}
