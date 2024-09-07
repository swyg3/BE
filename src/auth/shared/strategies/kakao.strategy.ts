import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>("KAKAO_CLIENT_ID"),
      clientSecret: configService.get<string>("KAKAO_CLIENT_SECRET"),
      callbackURL: "http://localhost:3000/api/users/kakao/callback",
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { _json } = profile;
    return {
      provider: "kakao",
      providerId: _json.id,
      name: _json.properties.nickname,
      email: _json.kakao_account.email,
      picture: _json.properties.profile_image,
    };
  }
}
