import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../commands/refresh-token.command";
import { TokenService } from "../../services/token.service";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { RefreshTokenService } from "../../services/refresh-token.service";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  private readonly logger = new Logger(RefreshTokenCommandHandler.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;
    this.logger.log(`리프레시 토큰 재발급 프로세스 시작`);

    const payload = await this.tokenService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException("INVALID_PAYLOAD");
    }
    this.logger.log(`리프레시 토큰 검증 성공: 사용자 ID ${payload.sub}`);

    const isBlacklisted =
      await this.refreshTokenService.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException("BLACKLISTED_TOKEN");
    }
    this.logger.log(`리프레시 토큰 블랙리스트 확인 완료`);

    const newTokens = await this.tokenService.generateTokens(
      payload.sub,
      payload.email,
      payload.userType,
    );
    this.logger.log(`새 토큰 생성 완료: 사용자 ID ${payload.sub}`);

    // 기존 토큰 블랙리스트에 추가
    await this.refreshTokenService.addToBlacklist(refreshToken);
    this.logger.log(
      `기존 리프레시 토큰 블랙리스트 추가 완료: 사용자 ID ${payload.sub}`,
    );

    // 새 리프레시 토큰 저장
    await this.refreshTokenService.storeRefreshToken(
      payload.sub,
      newTokens.refreshToken,
    );
    this.logger.log(`새 리프레시 토큰 저장 완료: 사용자 ID ${payload.sub}`);

    this.logger.log(
      `리프레시 토큰 재발급 프로세스 완료: 사용자 ID ${payload.sub}`,
    );

    return {
      access: {
        token: newTokens.accessToken,
        expiresIn: newTokens.accessTokenExpiresIn,
      },
      refresh: {
        token: newTokens.refreshToken,
        expiresIn: newTokens.refreshTokenExpiresIn,
      },
    };
  }
}
