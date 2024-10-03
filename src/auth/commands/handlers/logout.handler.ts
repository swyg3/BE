import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { LogoutCommand } from "../commands/logout.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { UserLoggedOutEvent } from "../../events/events/user-logged-out.event";
import { SellerLoggedOutEvent } from "../../events/events/seller-logged-out.event";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "src/auth/services/token.service";
import { Logger, UnauthorizedException } from "@nestjs/common";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LogoutCommand) {
    const { userId, accessToken, userType } = command;
    this.logger.log(`로그아웃 처리 중 `);

    try {
      await this.invalidateRefreshToken(userId);
      await this.invalidateAccessToken(accessToken);
      await this.publishLogoutEvent(userId, userType);

      this.logger.log(`로그아웃 처리 완료: ${userId}, ${userType}`);
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async invalidateRefreshToken(userId: string): Promise<void> {
    const refreshToken = await this.refreshTokenService.getRefreshToken(userId);
    if (refreshToken) {
      await this.refreshTokenService.addToBlacklist(refreshToken);
      await this.refreshTokenService.deleteRefreshToken(userId);
      this.logger.log(`리프레시 토큰 무효화 완료: ${userId}`);
    } else {
      this.logger.warn(`사용자 ${userId}의 리프레시 토큰을 찾을 수 없습니다.`);
    }
  }

  private async invalidateAccessToken(accessToken: string): Promise<void> {
    await this.refreshTokenService.addToBlacklist(accessToken);
    this.logger.log(`액세스 토큰 무효화 완료: ${accessToken}`);
  }

  private async publishLogoutEvent(
    userId: string,
    userType: string,
  ): Promise<void> {
    const event = this.createLogoutEvent(userId, userType);
    await this.eventBusService.publishAndSave(event);
  }

  private createLogoutEvent(
    userId: string,
    userType: string,
  ): UserLoggedOutEvent | SellerLoggedOutEvent {
    const eventData = { timestamp: new Date() };
    switch (userType) {
      case "user":
        return new UserLoggedOutEvent(userId, eventData, 1);
      case "seller":
        return new SellerLoggedOutEvent(userId, eventData, 1);
      default:
        throw new Error("유효하지 않은 사용자 유형");
    }
  }

  private handleError(error: Error): never {
    this.logger.error(
      `로그아웃 처리 중 오류 발생: ${error.message}`,
      error.stack,
    );
    throw new Error("로그아웃 처리 중 오류 발생");
  }
}
