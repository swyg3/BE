import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { LogoutCommand } from "../commands/logout.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { UserLoggedOutEvent } from "../../events/events/user-logged-out.event";
import { SellerLoggedOutEvent } from "../../events/events/seller-logged-out.event";
import { ConfigService } from "@nestjs/config";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LogoutCommand) {
    try {
    const { userId, accessToken, userType } = command;

    console.log({ userId, accessToken, userType });
    const accessTokenExpiry = this.configService.get<string>('ACCESS_TOKEN_EXPIRY')
    const refreshTokenExpiry = this.configService.get<string>('REFRESH_TOKEN_EXPIRY')

    const refreshToken = await this.refreshTokenService.getRefreshToken(userId);
    console.log({ userId, accessToken, refreshToken, userType });

    await Promise.all([
      this.refreshTokenService.deleteRefreshToken(userId),
      this.refreshTokenService.addToBlacklist(accessToken, accessTokenExpiry),
      this.refreshTokenService.addToBlacklist(refreshToken, refreshTokenExpiry)
    ]);

    let event;
    if (userType === 'user') {
      event = new UserLoggedOutEvent(userId, {
        timestamp: new Date(),
      }, 1);
    } else if (userType === 'seller') {
      event = new SellerLoggedOutEvent(userId, {
        timestamp: new Date(),
      }, 1);
    } else {
      throw new Error('Invalid user type');
    }

    await this.eventBusService.publishAndSave(event);

    return { success: true };
  } catch (error) {
    console.error('로그아웃 처리 중 오류 발생:', error);
    throw new Error('로그아웃 처리 중 오류 발생');
  }
}
}