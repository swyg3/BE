import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenService } from "../../services/token.service";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { LoginEmailCommand } from "../commands/login-email.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { UserLoggedInEvent } from "../../events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "../../events/events/seller-logged-in.event";
import {
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PasswordService } from "src/shared/services/password.service";

@CommandHandler(LoginEmailCommand)
export class LoginEmailCommandHandler
  implements ICommandHandler<LoginEmailCommand>
{
  private readonly logger = new Logger(LoginEmailCommandHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: LoginEmailCommand) {
    const { loginDto, req } = command;
    const userType =
      loginDto.userType || (req.path.includes("seller") ? "seller" : "user");

    this.logger.debug(
      `Login attempt - Path: ${req.path}, UserType: ${userType}`,
    );

    try {
      this.logger.log(`${userType} 로그인 시도 - 이메일: ${loginDto.email}`);

      // 1. 사용자 검증
      const user = await this.authenticateUser(
        loginDto.email,
        loginDto.password,
        userType,
      );

      // 2. 토큰 생성
      const {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      } = await this.tokenService.generateTokens(user.id, user.email, userType);
      this.logger.log(
        `JWT 생성: ${accessToken}, ${accessTokenExpiresIn}, ${refreshToken}, ${refreshTokenExpiresIn}`,
      );
      await this.refreshTokenService.storeRefreshToken(user.id, refreshToken);

      // 3. 로그인 이벤트 생성 및 발행
      this.logger.log(
        `${userType} 사용자 ID ${user.id}에 대한 이벤트 생성 및 발행`,
      );
      const event = this.createLoggedInEvent(user, userType, "email");
      await this.eventBusService.publishAndSave(event);

      // 4. 결과 반환
      return {
        [userType === "user" ? "userId" : "sellerId"]: user.id,
        email: user.email,
        name: user.name,
        userType: userType,
        agreeReceiveLocation: user.agreeReceiveLocation,
        tokens: {
          access: {
            token: accessToken,
            expiresIn: accessTokenExpiresIn,
          },
          refresh: {
            token: refreshToken,
            expiresIn: refreshTokenExpiresIn,
          },
        },
      };
    } catch (error) {
      this.logger.error("로그인 실패", error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException("로그인 중 오류가 발생했습니다.");
    }
  }

  private async authenticateUser(
    email: string,
    password: string,
    userType: string,
  ) {
    this.logger.log(`${userType} 사용자 이메일 ${email} 검증 중`);

    const repository =
      userType === "user" ? this.userRepository : this.sellerRepository;

    this.logger.debug(`Selected repository: ${repository.constructor.name}`);

    const user = await repository.findByEmail(email);
    if (!user) {
      this.logger.warn(
        `이메일 ${email}에 대한 사용자 정보를 찾을 수 없습니다.`,
      );
      throw new UnauthorizedException("등록되지 않은 이메일 주소입니다.");
    }
    this.logger.debug(`User found: ${user ? "Yes" : "No"}`);

    const isPasswordValid = await this.passwordService.verifyPassword(
      user.password,
      password,
    );
    if (!isPasswordValid) {
      this.logger.warn("비밀번호가 올바르지 않습니다.");
      throw new UnauthorizedException("비밀번호가 올바르지 않습니다.");
    }

    return user;
  }

  private createLoggedInEvent(user: any, userType: string, provider: string) {
    const timestamp = new Date();
    const eventData = {
      provider,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isNewUser: false,
      isEmailVerified: user.isEmailVerified,
      agreeReceiveLocation: user.agreeReceiveLocation,
      timestamp,
    };

    if (userType === "user") {
      return new UserLoggedInEvent(user.id, eventData, user.version || 1);
    } else {
      return new SellerLoggedInEvent(
        user.id,
        {
          ...eventData,
          isNewSeller: false,
          storeName: user.storeName,
          storeAddress: user.storeAddress,
          storePhoneNumber: user.storePhoneNumber,
          isBusinessNumberVerified: user.isBusinessNumberVerified,
        },
        user.version || 1,
      );
    }
  }
}
