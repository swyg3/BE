import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenService } from "../../services/token.service";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { LoginOAuthCommand } from "../commands/login-oauth.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { UserLoggedInEvent } from "../../events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "../../events/events/seller-logged-in.event";

@CommandHandler(LoginOAuthCommand)
export class LoginOAuthCommandHandler
  implements ICommandHandler<LoginOAuthCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LoginOAuthCommand) {
    const { provider, userType, accessToken } = command.loginOAuthDto;

    // 1. OAuth 제공자로부터 사용자 정보 가져오기
    const oauthUserInfo = await this.fetchUserInfo(provider, accessToken);

    // 2. 사용자 유형에 따라 처리
    const { user, isNew, event } = await this.handleUserOrSellerLogin(userType, oauthUserInfo);

    // 3. 토큰 생성
    const tokens = await this.tokenService.generateTokens(user.id, user.email, userType);
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
    };
  }

  private async fetchUserInfo(provider: string, accessToken: string) {
    // 인증 전략에 따라 사용자 정보를 가져오는 로직을 구현
    return {}; // 실제 사용자 정보 반환
  }

  private async handleUserOrSellerLogin(userType: string, oauthUserInfo: any) {
    let user;
    let isNew = false;
    let event: UserLoggedInEvent | SellerLoggedInEvent;

    if (userType === 'user') {
      ({ user, isNew } = await this.handleUserLogin(oauthUserInfo));
      event = new UserLoggedInEvent(
        user.id,
        {
          email: user.email,
          provider: oauthUserInfo.provider,
          isNewUser: isNew,
          timestamp: new Date()
        },
        user.version
      );
    } else if (userType === 'seller') {
      ({ user, isNew } = await this.handleSellerLogin(oauthUserInfo));
      event = new SellerLoggedInEvent(
        user.id,
        {
          email: user.email,
          provider: oauthUserInfo.provider,
          isNewSeller: isNew,
          isBusinessNumberVerified: user.isBusinessNumberVerified,
          timestamp: new Date()
        },
        user.version
      );
    } else {
      throw new Error('지원하지 않는 사용자 유형입니다.');
    }

    return { user, isNew, event };
  }

  private async handleUserLogin(oauthUserInfo: any) {
    // 일반 사용자 처리 로직
    const { user, isNewUser } = await this.userRepository.upsert(oauthUserInfo.email, {
      name: `${oauthUserInfo.firstName} ${oauthUserInfo.lastName}`,
      phoneNumber: oauthUserInfo.phone
    });
    
    return { user, isNew: isNewUser };
  }

  private async handleSellerLogin(oauthUserInfo: any) {
    // 판매자 처리 로직
    const { seller, isNewSeller } = await this.sellerRepository.upsert(oauthUserInfo.email, {
      name: oauthUserInfo.name,
    });
    
    return { user: seller, isNew: isNewSeller };
  }
}
