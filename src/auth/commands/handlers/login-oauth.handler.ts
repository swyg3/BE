import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenService } from "../../services/token.service";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { LoginOAuthCommand } from "../commands/login-oauth.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { RefreshTokenService } from "../../services/refresh-token.service";
import { UserLoggedInEvent } from "../../events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "../../events/events/seller-logged-in.event";
import { BadRequestException, Logger, Injectable, Inject } from "@nestjs/common";
import axios from "axios";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";

enum UserType {
  USER = "user",
  SELLER = "seller",
}

interface OAuthProvider {
  getUserInfoUrl(): string;
  mapUserInfo(data: any): any;
}

@Injectable()
class GoogleOAuthProvider implements OAuthProvider {
  getUserInfoUrl() {
    return "https://www.googleapis.com/oauth2/v3/userinfo";
  }

  mapUserInfo(data: any) {
    return {
      email: data.email,
      name: data.name || `${data.given_name || ""} ${data.family_name || ""}`,
      phoneNumber: data.phone || "",
    };
  }
}

@Injectable()
class KakaoOAuthProvider implements OAuthProvider {
  getUserInfoUrl() {
    return "https://kapi.kakao.com/v2/user/me";
  }

  mapUserInfo(data: any) {
    const kakaoAccount = data.kakao_account || {};
    return {
      email: kakaoAccount.email,
      name: kakaoAccount.profile?.nickname || "",
      phoneNumber: kakaoAccount.phone_number || "",
    };
  }
}

@CommandHandler(LoginOAuthCommand)
export class LoginOAuthCommandHandler
  implements ICommandHandler<LoginOAuthCommand>
{
  private readonly logger = new Logger(LoginOAuthCommandHandler.name);
  private readonly oauthProviders: { [key: string]: OAuthProvider } = {
    google: new GoogleOAuthProvider(),
    kakao: new KakaoOAuthProvider(),
  };

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: LoginOAuthCommand) {
    const { provider, oneTimeToken, userType } = command;

    if (!Object.values(UserType).includes(userType as UserType)) {
      throw new BadRequestException("잘못된 사용자 유형입니다.");
    }

    this.logger.log(
      `OAuth 로그인 요청 받음: provider=${provider}, userType=${userType}`,
    );

    const oauthProvider = this.oauthProviders[provider];
    if (!oauthProvider) {
      throw new BadRequestException("지원하지 않는 OAuth 제공자입니다.");
    }

    // 일회용 토큰으로 실제 액세스 토큰 가져오기
    const accessToken = await this.useOneTimeToken(oneTimeToken);
    if (!accessToken) {
      throw new BadRequestException("유효하지 않거나 만료된 토큰입니다.");
    }

    const oauthUserInfo = await this.fetchUserInfo(oauthProvider, accessToken);
    const userInfo = oauthProvider.mapUserInfo(oauthUserInfo);
    this.logger.log(
      `OAuth 제공자로부터 사용자 정보 가져옴: ${JSON.stringify(userInfo)}`,
    );

    if (!userInfo.email) {
      throw new BadRequestException(
        "OAuth 제공자로부터 이메일을 가져오지 못했습니다.",
      );
    }

    const { user, event } = await this.handleUserOrSellerLogin(
      userType as UserType,
      userInfo,
      provider,
    );

    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      userType,
    );
    await this.refreshTokenService.storeRefreshToken(
      user.id,
      tokens.refreshToken,
    );
    this.logger.log(`토큰 생성 완료, ${JSON.stringify(tokens)}`);

    await this.eventBusService.publishAndSave(event);
    this.logger.log("이벤트 발행 및 저장 완료");

    return {
      [userType === UserType.USER ? "userId" : "sellerId"]: user.id,
      email: user.email,
      name: user.name,
      userType: userType,
      ...tokens,
    };
  }

  private async fetchUserInfo(
    oauthProvider: OAuthProvider,
    accessToken: string,
  ) {
    const response = await axios.get(oauthProvider.getUserInfoUrl(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  private async handleUserOrSellerLogin(
    userType: UserType,
    userInfo: any,
    provider: string,
  ) {
    let user;
    let isNew;
    let event;

    this.logger.log(`처리할 유저 정보: ${JSON.stringify(userInfo)}`);

    if (userType === UserType.USER) {
      const result = await this.userRepository.upsert(userInfo.email, {
        name: userInfo.name,
        phoneNumber: userInfo.phoneNumber || "",
        password: "",
      });
      user = result.user;
      isNew = result.isNewUser;
      event = new UserLoggedInEvent(
        user.id,
        {
          email: user.email,
          provider,
          isNewUser: isNew,
          isEmailVerified: true,
          timestamp: new Date(),
        },
        user.version || 1,
      );
    } else {
      const result = await this.sellerRepository.upsert(userInfo.email, {
        name: userInfo.name,
        phoneNumber: userInfo.phoneNumber || "",
        password: "",
        isEmailVerified: true,
      });
      user = result.seller;
      isNew = result.isNewSeller;
      event = new SellerLoggedInEvent(
        user.id,
        {
          email: user.email,
          provider,
          isNewSeller: isNew,
          isEmailVerified: true,
          isBusinessNumberVerified: user.isBusinessNumberVerified,
          timestamp: new Date(),
        },
        user.version || 1,
      );
    }
    this.logger.log(`User or Seller 생성: ${JSON.stringify(user)}`);
    this.logger.log(`생성된 이벤트: ${JSON.stringify(event)}`);
    
    return { user, event };
  }

  async useOneTimeToken(token: string): Promise<string | null> {
    const value = await this.redisClient.get(token);
    if (value) {
      await this.redisClient.del(token);
    }
    return value;
  }
}
