import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { LoginEmailCommand } from '../commands/login-email.command';
import { UserLoggedInEvent } from '../../events/events/logged-in.event';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import { Inject, UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';
import { EventBusService } from 'src/shared/infrastructure/cqrs/event-bus.service';


@CommandHandler(LoginEmailCommand)
export class LoginEmailCommandHandler implements ICommandHandler<LoginEmailCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly eventBusService: EventBusService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: LoginEmailCommand) {
    const { loginDto, userType, loginMethod } = command;
    try {
      // 사용자 검증
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('인증 실패: 이메일과 비밀번호를 확인해주세요.')
      }

      // 토큰 발급
      const tokens = await this.tokenService.generateTokens(user.id);

      // AccessToken 이벤트 스토어에 저장
      const loggedInEvent = new UserLoggedInEvent(
        user.id,
        userType as 'user' | 'seller',
        loginMethod,
        tokens.accessToken,
        1
      );
      await this.eventBusService.publishAndSave(loggedInEvent);

      // RefreshToken을 Redis에 저장
      await this.redisClient.set(`refresh_token:${user.id}`, tokens.refreshToken, 'EX', 604800); // 7일

      return { 
        success: true, 
        data: {
          userId: user.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }, 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { success: false, message: error.message };
      }
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  }
}