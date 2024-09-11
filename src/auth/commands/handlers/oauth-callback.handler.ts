import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { OAuthCallbackCommand } from '../commands/oauth-callback.command';


@Injectable()
@CommandHandler(OAuthCallbackCommand)
export class LoginOAuthCallbackCommandHandler implements ICommandHandler<OAuthCallbackCommand> {
  private readonly logger = new Logger(LoginOAuthCallbackCommandHandler.name);

  constructor(private readonly configService: ConfigService) {}

  async execute(command: OAuthCallbackCommand): Promise<any> {
    const { provider, code } = command.oauthCallbackDto;

    let tokenUrl: string;
    let clientId: string;
    let clientSecret: string;
    let redirectUri: string;

    if (provider === 'google') {
      tokenUrl = 'https://oauth2.googleapis.com/token';
      clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      redirectUri = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    } else if (provider === 'kakao') {
      tokenUrl = 'https://kauth.kakao.com/oauth/token';
      clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
      clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET');
      redirectUri = this.configService.get<string>('KAKAO_CALLBACK_URL');
    } else {
      throw new Error(`${provider}: 지원하지 않는 기능입니다.`);
    }
    
    try {
      // 1. 액세스 토큰 요청
      const tokenResponse = await axios.post(tokenUrl, null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      });

      this.logger.log(`${provider}에서 ${tokenResponse.data.access_token}을 성공적으로 받았습니다.`);

      // 3. 인증 토큰 반환
      return {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        provider,
      };

    } catch (error) {
      this.logger.error(`OAuth Callback 처리 중 오류 발생: ${error.message}`);
      throw new Error('OAuth Callback 실패');
    }
  }
}
