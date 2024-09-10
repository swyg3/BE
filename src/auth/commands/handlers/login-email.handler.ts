import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenService } from "../../services/token.service";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { LoginEmailCommand } from "../commands/login-email.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { UserLoggedInEvent } from "../../events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "../../events/events/seller-logged-in.event";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import * as argon2 from "argon2";

@CommandHandler(LoginEmailCommand)
export class LoginEmailCommandHandler implements ICommandHandler<LoginEmailCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LoginEmailCommand) {
    const { loginDto, req } = command;
    const userType = req.path.includes('seller') ? 'seller' : 'user';
    const provider = 'email';

    try {
      // 1. 사용자 검증
      let user;
      let isNew = false;
      let event: UserLoggedInEvent | SellerLoggedInEvent;

      if (userType === 'user') {
        ({ user, isNew } = await this.handleUserLogin(loginDto.email, loginDto.password));
        event = new UserLoggedInEvent(
          user.id,
          {
            email: user.email,
            provider,
            isNewUser: isNew,
          },
          user.version
        );
      } else if (userType === 'seller') {
        ({ user, isNew } = await this.handleSellerLogin(loginDto.email, loginDto.password));
        event = new SellerLoggedInEvent(
          user.id,
          {
            email: user.email,
            provider,
            isNewSeller: isNew,
            isBusinessNumberVerified: user.isBusinessNumberVerified,
          },
          user.version
        );
      } else {
        throw new BadRequestException('지원하지 않는 사용자 유형입니다.');
      }

      // 2. 토큰 생성
      const tokens = await this.tokenService.generateTokens(user.id, userType);
      await this.refreshTokenService.storeRefreshToken(user.id, tokens.refreshToken);

      // 3. 이벤트 발행 및 저장
      await this.eventBusService.publishAndSave(event);

      // 4. 결과 반환
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: userType,
          },
          ...tokens,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException("로그인 중 오류가 발생했습니다.");
    }
  }

  private async handleUserLogin(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("등록되지 않은 이메일 주소입니다.");
    }
    await this.verifyPassword(password, user.password);
    const { user: updatedUser, isNewUser } = await this.userRepository.upsert(email, {
      lastLoginAt: new Date(),
    });
    return { user: updatedUser, isNew: isNewUser };
  }

  private async handleSellerLogin(email: string, password: string) {
    const seller = await this.sellerRepository.findByEmail(email);
    if (!seller) {
      throw new UnauthorizedException("등록되지 않은 이메일 주소입니다.");
    }
    await this.verifyPassword(password, seller.password);
    const { seller: updatedSeller, isNewSeller } = await this.sellerRepository.upsert(email, {
      lastLoginAt: new Date(),
    });
    return { user: updatedSeller, isNew: isNewSeller };
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string) {
    const isPasswordValid = await argon2.verify(hashedPassword, plainPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException("비밀번호가 올바르지 않습니다.");
    }
  }
}