import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../commands/refresh-token.command";
import { TokenService } from "../../services/token.service";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;

    const payload = await this.tokenService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException("유효하지 않은 리프레시 토큰");
    }

    const storedRefreshToken = await this.refreshTokenService.getRefreshToken(
      payload.sub,
    );
    if (storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException("Refresh token mismatch");
    }

    const isBlacklisted =
      await this.refreshTokenService.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException("Refresh token has been revoked");
    }

    const newTokens = await this.tokenService.generateTokens(
      payload.sub,
      payload.email,
      payload.userType,
    );
    await this.refreshTokenService.storeRefreshToken(
      payload.sub,
      newTokens.refreshToken,
    );
    await this.refreshTokenService.deleteRefreshToken(payload.sub);

    return newTokens;
  }
}
