import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { OAuthCallbackCommand } from "../commands/oauth-callback.command";
import { v4 as uuidv4 } from 'uuid';
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";

@Injectable()
@CommandHandler(OAuthCallbackCommand)
export class LoginOAuthCallbackCommandHandler
  implements ICommandHandler<OAuthCallbackCommand>
{
  private readonly logger = new Logger(LoginOAuthCallbackCommandHandler.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: OAuthCallbackCommand): Promise<any> {
    const { provider, code, userType } = command.oauthCallbackDto;

    this.logger.debug(`Received OAuth callback - Provider: ${provider}, Code: ${code}, userType: ${userType}`);

    let tokenUrl: string;
    let clientId: string;
    let clientSecret: string;
    let redirectUri: string;

    if (provider === "google") {
      tokenUrl = "https://oauth2.googleapis.com/token";
      clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
      clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET");
      redirectUri = this.configService.get<string>("GOOGLE_CALLBACK_URL");
    } else if (provider === "kakao") {
      tokenUrl = "https://kauth.kakao.com/oauth/token";
      clientId = this.configService.get<string>("KAKAO_CLIENT_ID");
      clientSecret = this.configService.get<string>("KAKAO_CLIENT_SECRET");
      redirectUri = this.configService.get<string>("KAKAO_CALLBACK_URL");
    } else {
      throw new Error(`${provider}: 지원하지 않는 기능입니다.`);
    }

    // 설정 로깅
    this.logger.debug(`Provider: ${provider}`);
    this.logger.debug(`Client ID: ${clientId}`);
    this.logger.debug(`Redirect URI: ${redirectUri}`);

    try {
      // 1. 액세스 토큰 요청
      const tokenResponse = await axios.post(tokenUrl, null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
        validateStatus: () => true,
      });

      if (tokenResponse.status !== 200) {
        this.logger.error(
          `OAuth 토큰 요청 실패: ${JSON.stringify(tokenResponse.data)}`,
        );
        throw new Error(`OAuth 토큰 요청 실패: ${tokenResponse.status}`);
      }

      this.logger.log(
        `${provider}에서 ${tokenResponse.data.access_token}을 성공적으로 받았습니다.`,
      );

      // 3. 일회용 토큰 생성
      const oneTimeToken = await this.createOneTimeToken(tokenResponse.data.access_token);

      // 4. 인증 토큰 반환
      this.logger.log(
        `${oneTimeToken}으로 변환해서 응답합니다.`,
      );
      return {
        oneTimeToken,
        provider,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`OAuth 토큰 요청 실패: ${error.response?.status} ${error.response?.statusText}`);
        this.logger.error(`오류 상세: ${JSON.stringify(error.response?.data)}`);
      } else {
        this.logger.error(`OAuth Callback 처리 중 오류 발생: ${error.message}`);
      }
      throw new Error(`OAuth Callback 실패: ${error.message}`);
    }
  }

  async createOneTimeToken(value: string, expirationSeconds: number = 300): Promise<string> {
    const token = uuidv4();
    await this.redisClient.set(token, value, 'EX', expirationSeconds);
    return token;
  }
}
