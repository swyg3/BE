import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenService } from "../../services/token.service";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { LoginOAuthCommand } from "../commands/login-oauth.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { UserLoggedInEvent } from "../../events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "../../events/events/seller-logged-in.event";
import { GoogleStrategy } from "../../strategies/google.strategy";
import { KakaoStrategy } from "../../strategies/kakao.strategy";

@CommandHandler(LoginOAuthCommand)
export class LoginOAuthCommandHandler
  implements ICommandHandler<LoginOAuthCommand>
{
  constructor(
    private googleStrategy: GoogleStrategy,
    private kakaoStrategy: KakaoStrategy,
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LoginOAuthCommand) {

    const { provider, userType, accessToken } = command.loginOAuthDto;

    // 0. OAuth 전략 유형에 따라 처리
    let strategy;
    if (provider === 'google') {
      strategy = this.googleStrategy;
    } else if (provider === 'kakao') {
      strategy = this.kakaoStrategy;
    } else {
      throw new Error('지원하지 않는 소셜 제공자입니다.');
    }

    // 1. OAuth 제공자로부터 사용자 정보 가져오기
    const oauthUserInfo = await strategy.validate(accessToken);

    // 2. 사용자 유형에 따라 처리
    let user;
    let isNew = false;
    let event: UserLoggedInEvent | SellerLoggedInEvent;

    if (userType === 'user') {
      ({ user, isNew } = await this.handleUserLogin(oauthUserInfo));
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
      ({ user, isNew } = await this.handleSellerLogin(oauthUserInfo));
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
      throw new Error('지원하지 않는 사용자 유형입니다.');
    }

    // 3. 토큰 생성
    const tokens = await this.tokenService.generateTokens(user.id, userType);
    await this.refreshTokenService.storeRefreshToken(user.id, tokens.refreshToken);

    // 이벤트 발행 및 저장
    await this.eventBusService.publishAndSave(event);

    // 4. 결과 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: userType,
      },
      ...tokens,
    }
  }

  private async handleUserLogin(oauthUserInfo: any) {
    // 일반 사용자 처리 로직
    const { user, isNewUser } = await this.userRepository.upsert(oauthUserInfo.email, {
      name: `${oauthUserInfo.firstName} ${oauthUserInfo.lastName}`,
      phoneNumber: oauthUserInfo.phone
    });
    await this.userRepository.updateUserLastLogin(user.id);
    return { user, isNew: isNewUser };
  }

  private async handleSellerLogin(oauthUserInfo: any) {
    // 판매자 처리 로직
    const { seller, isNewSeller } = await this.sellerRepository.upsert(oauthUserInfo.email, {
      name: oauthUserInfo.name,
    });
    
    await this.sellerRepository.updateSellerLastLogin(seller.id);
    return { user: seller, isNew: isNewSeller };
  }
}


