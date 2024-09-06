import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { TokenService } from '../../services/token.service';
import { TokenRefreshedEvent } from '../../events/events/refresh-token.event';
import { UnauthorizedException } from '@nestjs/common';
import { EventBusService } from 'src/shared/infrastructure/cqrs/event-bus.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;
    try {
      const payload = await this.tokenService.verifyToken(refreshToken);
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
      }
      const newAccessToken = await this.tokenService.createAccessToken({ sub: payload.sub });
      
      const tokenRefreshedEvent = new TokenRefreshedEvent(payload.sub, newAccessToken);
      await this.eventBusService.publishAndSave(tokenRefreshedEvent);

      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { success: false, message: error.message };
      }
      return { success: false, message: '토큰 갱신 중 오류가 발생했습니다.' };
    }
  }
}