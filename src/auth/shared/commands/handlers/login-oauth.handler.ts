import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginOAuthCommand } from '../commands/login-oauth.command';
import { TokenService } from '../../services/token.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { UserLoggedInEvent } from '../../events/events/logged-in.event';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import Redis from 'ioredis';
import { UserRegisteredEvent } from 'src/users/events/events/user-registered.event';
import { EventBusService } from 'src/shared/infrastructure/cqrs/event-bus.service';
import { SellerRepository } from 'src/sellers/repositories/seller.repository';

@CommandHandler(LoginOAuthCommand)
export class LoginOAuthCommandHandler implements ICommandHandler<LoginOAuthCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly eventBusService: EventBusService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: LoginOAuthCommand) {
    const { user, provider, userType, providerType, req } = command;

    try {
      // 사용자 검증 및 Upsert
      const commonData = {
        name: user.name,
        phoneNumber: user.phoneNumber,
        provider: providerType,
        isEmailVerified: true,
      };

      let upsertedEntity;
      let isNewEntity;
      if (userType === 'user') {
        const { user: upsertedUser, isNewUser } = await this.userRepository.upsert(user.email, commonData);
        upsertedEntity = upsertedUser;
        isNewEntity = isNewUser;
      } else if (userType === 'seller') {
        const { seller: upsertedSeller, isNewSeller } = await this.sellerRepository.upsert(user.email, commonData);
        upsertedEntity = upsertedSeller;
        isNewEntity = isNewSeller;
      } else {
        throw new UnauthorizedException('잘못된 사용자 타입입니다.');
      }

      // 토큰 발급
      const tokens = await this.tokenService.generateTokens(upsertedEntity.id);

      // UserLoggedIn 이벤트를 이벤트 스토어에 저장
      const loggedInEvent = new UserLoggedInEvent(
        upsertedEntity.id,
        userType as 'user' | 'seller',
        providerType,
        tokens.accessToken,
        1
      );
      await this.eventBusService.publishAndSave(loggedInEvent);

      // RefreshToken을 Redis에 저장
      await this.redisClient.set(
        `refresh_token:${upsertedEntity.id}`, 
        tokens.refreshToken, 
        'EX', 
        604800
      ); // 7일

      // 이벤트 발행
      if (isNewEntity) {
        const registeredEvent = new UserRegisteredEvent(
          upsertedEntity.id,
          upsertedEntity.email,
          upsertedEntity.name,
          upsertedEntity.phoneNumber,
          true,
          1
        );
        await this.eventBusService.publishAndSave(registeredEvent);
      }

      return {
        success: true,
        data: {
          entityId: upsertedEntity.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          userType,
          provider: providerType
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'OAuth 로그인 중 오류가 발생했습니다.' };
    }
  }
}