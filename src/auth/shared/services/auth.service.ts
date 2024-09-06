import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/users/repositories/user.repository';
import * as argon2 from 'argon2';
import { UserLoggedInEvent } from '../events/events/logged-in.event';
import { UserLoggedOutEvent } from '../events/events/logged-out.event';
import { TokenRefreshedEvent } from '../events/events/refresh-token.event';
import { EventBusService } from 'src/shared/infrastructure/cqrs/event-bus.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly eventBusService: EventBusService,
    private readonly userRepository: UserRepository
  ) {}

  async validateUser(email: string, plainPassword: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('등록되지 않은 이메일 주소입니다.');
    }

    const isPasswordValid = await argon2.verify(user.password, plainPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }
    
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('이메일 인증이 완료되지 않았습니다.');
    }

    const { password, ...result } = user;
    return result;
  }


  async publishUserLoggedInEvent(userId: string, userType: 'user' | 'seller', loginMethod: 'email' | 'google' | 'kakao', accessToken: string) {
    const event = new UserLoggedInEvent(userId, userType, loginMethod, accessToken);
    await this.eventBusService.publishAndSave(event);
  }

  async publishUserLoggedOutEvent(userId: string) {
    const event = new UserLoggedOutEvent(userId);
    await this.eventBusService.publishAndSave(event);
  }

  async publishTokenRefreshedEvent(userId: string, newAccessToken: string) {
    const event = new TokenRefreshedEvent(userId, newAccessToken);
    await this.eventBusService.publishAndSave(event);
  }
}