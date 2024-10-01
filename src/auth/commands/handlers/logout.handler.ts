import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { LogoutCommand } from "../commands/logout.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { UserLoggedOutEvent } from "../../events/events/user-logged-out.event";
import { SellerLoggedOutEvent } from "../../events/events/seller-logged-out.event";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "src/auth/services/token.service";
import { UnauthorizedException } from "@nestjs/common";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutCommand) {
    try {
      const { userId, accessToken, userType } = command;

      // 액세스 토큰 검증
      try {
        await this.tokenService.verifyToken(accessToken);
      } catch (error) {
        console.warn("만료된 액세스 토큰으로 로그아웃 시도:", error.message);
      }

      const accessTokenExpiry = this.configService.get<string>(
        "ACCESS_TOKEN_EXPIRY",
      );
      const refreshTokenExpiry = this.configService.get<string>(
        "REFRESH_TOKEN_EXPIRY",
      );

      const refreshToken =
        await this.refreshTokenService.getRefreshToken(userId);
      console.log({ userId, accessToken, refreshToken, userType });

      if (!refreshToken) {
        console.warn(`사용자 ${userId}의 리프레시 토큰을 찾을 수 없습니다.`);
      }

      await Promise.all([
        this.refreshTokenService.deleteRefreshToken(userId),
        this.refreshTokenService.addToBlacklist(accessToken, accessTokenExpiry),
        refreshToken
          ? this.refreshTokenService.addToBlacklist(
              refreshToken,
              refreshTokenExpiry,
            )
          : Promise.resolve(),
      ]);

      let event;
      if (userType === "user") {
        event = new UserLoggedOutEvent(
          userId,
          {
            timestamp: new Date(),
          },
          1,
        );
      } else if (userType === "seller") {
        event = new SellerLoggedOutEvent(
          userId,
          {
            timestamp: new Date(),
          },
          1,
        );
      } else {
        throw new Error("Invalid user type");
      }

      await this.eventBusService.publishAndSave(event);

      return { success: true };
    } catch (error) {
      console.error("로그아웃 처리 중 오류 발생:", error);
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException("유효하지 않은 토큰으로 로그아웃 시도");
      }
      throw new Error("로그아웃 처리 중 오류 발생");
    }
  }
}
