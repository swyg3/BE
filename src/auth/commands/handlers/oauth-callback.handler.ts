import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { OAuthCallbackCommand } from "../commands/oauth-callback.command";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { TokenService } from "src/auth/services/token.service";
import { RefreshTokenService } from "src/auth/services/refresh-token.service";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { UserLoggedInEvent } from "src/auth/events/events/user-logged-in.event";
import { SellerLoggedInEvent } from "src/auth/events/events/seller-logged-in.event";

enum UserType {
  USER = "user",
  SELLER = "seller",
}

@Injectable()
@CommandHandler(OAuthCallbackCommand)
export class LoginOAuthCallbackCommandHandler
  implements ICommandHandler<OAuthCallbackCommand>
{
  private readonly logger = new Logger(LoginOAuthCallbackCommandHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: OAuthCallbackCommand): Promise<any> {
    const { provider, code, userType } = command;

    this.logger.log(
      `OAuth 로그인 요청 받음: provider=${provider}, userType=${userType}`,
    );

    try {
      // 1. 인증 코드로 액세스 토큰 요청
      const accessToken = await this.getAccessToken(provider, code);

      // 2. 액세스 토큰으로 사용자 정보 요청
      const userInfo = await this.getUserInfo(provider, accessToken);

      // 3. 사용자 생성 또는 업데이트
      const { user, event } = await this.handleUserOrSellerLogin(
        userType as UserType,
        userInfo,
        provider,
      );

      // 4. JWT 생성
      const tokens = await this.tokenService.generateTokens(
        user.id,
        user.email,
        userType,
      );

      await this.refreshTokenService.storeRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      // 5. 이벤트 발행
      await this.eventBusService.publishAndSave(event);

      // 6. JWT 및 사용자 정보 반환
      return {
        provider,
        [userType === UserType.USER ? "userId" : "sellerId"]: user.id,
        email: user.email,
        name: user.name,
        userType: userType,
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`OAuth Callback 처리 중 오류 발생: ${error.message}`);
      throw new Error(`OAuth Callback 실패: ${error.message}`);
    }
  }

  private async getAccessToken(
    provider: string,
    code: string,
  ): Promise<string> {
    try {
      const tokenUrl = this.configService.get<string>(
        `${provider.toUpperCase()}_TOKEN_URL`,
      );
      const clientId = this.configService.get<string>(
        `${provider.toUpperCase()}_CLIENT_ID`,
      );
      const clientSecret = this.configService.get<string>(
        `${provider.toUpperCase()}_CLIENT_SECRET`,
      );
      const redirectUri = this.configService.get<string>(
        `${provider.toUpperCase()}_CALLBACK_URL`,
      );

      const response = await axios.post(tokenUrl, null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
      });
      this.logger.log(`getAccessToken: response=${response}`);
      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to get access token. Status: ${error.response?.status}`,
        );
        this.logger.error(
          `Error data: ${JSON.stringify(error.response?.data)}`,
        );
      }
      throw error;
    }
  }

  private async getUserInfo(
    provider: string,
    accessToken: string,
  ): Promise<any> {
    const userInfoUrl = this.configService.get<string>(
      `${provider.toUpperCase()}_USER_INFO_URL`,
    );
    const response = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    this.logger.log(
      `getUserInfo: userInfoUrl=${userInfoUrl}, userType=${response}`,
    );
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

    if (userType === UserType.USER) {
      const result = await this.userRepository.upsert(userInfo.email, {
        name: userInfo.name,
        phoneNumber: userInfo.phoneNumber || null,
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
        phoneNumber: userInfo.phoneNumber || null,
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
    this.logger.log(`event: user=${user}, event=${event}`);
    return { user, event };
  }
}
