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
import { UserType } from "src/auth/interfaces/user-type.type";

type LoginResult = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  isNew: boolean;
  version?: number;
  isEmailVerified: boolean;
  isBusinessNumberVerified?: boolean;
  storeName?: string;
  storeAddress?: string;
  storePhoneNumber?: string;
};

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
      `OAuth 로그인 요청 시작: 제공자=${provider}, 사용자 유형=${UserType[userType]}, 코드=${code.substring(0, 10)}...`,
    );

    try {
      // 1. 인증 코드로 액세스 토큰 요청
      this.logger.log(`1단계 시작: 액세스 토큰 요청 (제공자: ${provider})`);
      const oauthAccessToken = await this.getAccessToken(provider, code);
      this.logger.log(
        `1단계 완료: 액세스 토큰 획득 성공 (토큰 길이: ${oauthAccessToken})`,
      );

      // 2. 액세스 토큰으로 사용자 정보 요청
      this.logger.log(`2단계 시작: 사용자 정보 요청 (제공자: ${provider})`);
      const userInfo = await this.getUserInfo(provider, oauthAccessToken);
      this.logger.log(
        `2단계 완료: 사용자 정보 획득 성공 (이메일: ${userInfo.email})`,
      );

      // 3. 사용자 생성 또는 업데이트
      this.logger.log(`3단계 시작: 사용자 정보 처리 (유형: ${userType})`);
      const result = await this.handleUserOrSellerLogin(userType, userInfo);
      this.logger.log(
        `3단계 완료: 사용자 정보 처리 완료 (ID: ${result.id}, 이메일: ${result.email}, 신규 여부: ${result.isNew})`,
      );

      // 4. JWT 생성
      this.logger.log(`4단계 시작: JWT 토큰 생성`);
      const {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      } = await this.tokenService.generateTokens(
        result.id,
        result.email,
        userType,
      );

      this.logger.log(
        `4단계 완료: JWT 토큰 생성 완료 ${accessToken}, ${accessTokenExpiresIn}, ${refreshToken}, ${refreshTokenExpiresIn}`,
      );

      await this.refreshTokenService.storeRefreshToken(result.id, refreshToken);

      this.logger.log(`리프레시 토큰 저장 완료 (사용자 ID: ${result.id})`);

      // 5. 이벤트 발행
      this.logger.log(`5단계 시작: 로그인 이벤트 발행`);
      const event = this.createEvent(userType, result, provider);
      await this.eventBusService.publishAndSave(event);

      this.logger.log(
        `5단계 완료: 로그인 이벤트 발행 완료 (이벤트 타입: ${event.constructor.name})`,
      );

      // 6. JWT 및 사용자 정보 반환
      this.logger.log(`6단계: 최종 응답 데이터 준비`);
      const response = {
        provider,
        [userType === UserType.USER ? "userId" : "sellerId"]: result.id,
        email: result.email,
        name: result.name,
        userType: userType,
        tokens: {
          access: {
            token: accessToken,
            expiresIn: accessTokenExpiresIn,
          },
          refresh: {
            token: refreshToken,
            expiresIn: refreshTokenExpiresIn,
          },
        },
      };
      this.logger.log(
        `OAuth 로그인 프로세스 완료: 사용자 ${response.email} 로그인 성공`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `OAuthCallbackCommandHandler 처리 중 오류 발생: ${error.message}`,
      );
      this.logger.error(
        `OAuthCallbackCommandHandler 오류 상세 정보: ${JSON.stringify(error.response?.data || error)}`,
      );
      throw new Error(`OAuth Callback 실패: ${error.message}`);
    }
  }

  private async getAccessToken(
    provider: string,
    code: string,
  ): Promise<string> {
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

    this.logger.log(`액세스 토큰 요청 시작 (제공자: ${provider})`);
    this.logger.log(`토큰 URL: ${tokenUrl}`);
    this.logger.log(`리다이렉트 URI: ${redirectUri}`);

    try {
      const response = await axios.post(tokenUrl, null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
      });
      this.logger.log(`액세스 토큰 요청 성공 (상태 코드: ${response.status})`);
      this.logger.log(`응답 데이터: ${JSON.stringify(response.data)}`);

      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `액세스 토큰 요청 실패. 상태 코드: ${error.response?.status}`,
        );
        this.logger.error(
          `액세스 토큰 요청 오류 상세 정보: ${JSON.stringify(error.response?.data)}`,
        );
        this.logger.error(
          `액세스 토큰 요청 설정: ${JSON.stringify(error.config)}`,
        );
      }
      throw error;
    }
  }

  private async getUserInfo(
    provider: string,
    oauthAccessToken: string,
  ): Promise<any> {
    const userInfoUrl = this.configService.get<string>(
      `${provider.toUpperCase()}_USER_INFO_URL`,
    );
    this.logger.log(`사용자 정보 요청 시작 (제공자: ${provider})`);
    this.logger.log(`사용자 정보 URL: ${userInfoUrl}`);

    try {
      const response = await axios.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${oauthAccessToken}` },
      });

      this.logger.log(`사용자 정보 요청 성공 (상태 코드: ${response.status})`);

      const normalizedInfo = this.normalizeUserInfo(provider, response.data);
      this.logger.log(
        `정규화된 사용자 정보: ${JSON.stringify(normalizedInfo)}`,
      );

      return normalizedInfo;
    } catch (error) {
      this.logger.error(`사용자 정보 획득 실패: ${error.message}`);
      this.logger.error(
        `오류 응답 데이터: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(`사용자 정보 획득 실패: ${error.message}`);
    }
  }

  private normalizeUserInfo(provider: string, rawUserInfo: any): any {
    switch (provider) {
      case "google":
        return {
          email: rawUserInfo.email,
          name:
            rawUserInfo.name ||
            `${rawUserInfo.given_name || ""} ${rawUserInfo.family_name || ""}`,
        };
      case "kakao":
        return {
          email: rawUserInfo.kakao_account.email,
          name: rawUserInfo.profile?.nickname || "",
        };
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async handleUserOrSellerLogin(
    userType: string,
    userInfo: any,
  ): Promise<LoginResult> {
    this.logger.log(`handleUserOrSellerLogin userType: ${userType}`);

    if (userType === UserType.USER) {
      const { user, isNewUser } = await this.userRepository.upsert(
        userInfo.email,
        {
          name: userInfo.name,
          phoneNumber: "휴대폰 번호를 입력해주세요",
          password: "",
          isEmailVerified: true,
        },
      );
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isNew: isNewUser,
        isEmailVerified: user.isEmailVerified,
      };
    } else {
      const { seller, isNewSeller } = await this.sellerRepository.upsert(
        userInfo.email,
        {
          name: userInfo.name,
          phoneNumber: "휴대폰 번호를 입력해주세요",
          password: "",
          isEmailVerified: true,
          storeName: `${userInfo.name}님의 매장`,
          storeAddress: "매장 주소를 입력해주세요.",
          storePhoneNumber: "매장 전화번호를 입력해주세요.",
          isBusinessNumberVerified: false,
        },
      );
      return {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        isNew: isNewSeller,
        isEmailVerified: seller.isEmailVerified,
        storeName: seller.storeName,
        storeAddress: seller.storeAddress,
        storePhoneNumber: seller.storePhoneNumber,
        isBusinessNumberVerified: seller.isBusinessNumberVerified,
      };
    }
  }

  private createEvent(userType: string, result: LoginResult, provider: string) {
    if (userType === UserType.USER) {
      return new UserLoggedInEvent(
        result.id,
        {
          provider,
          email: result.email,
          name: result.name,
          phoneNumber: result.phoneNumber,
          isNewUser: result.isNew,
          isEmailVerified: true,
          timestamp: new Date(),
        },
        result.version || 1,
      );
    } else if (userType === UserType.SELLER) {
      return new SellerLoggedInEvent(
        result.id,
        {
          provider,
          email: result.email,
          name: result.name,
          phoneNumber: result.phoneNumber,
          isNewSeller: result.isNew,
          isEmailVerified: true,
          storeName: result.storeName,
          storeAddress: result.storeAddress,
          storePhoneNumber: result.storePhoneNumber,
          isBusinessNumberVerified: result.isBusinessNumberVerified,
          timestamp: new Date(),
        },
        result.version || 1,
      );
    } else {
      throw new Error(`Invalid user type: ${userType}`);
    }
  }
}
