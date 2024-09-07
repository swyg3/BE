import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 토큰 발급
  async generateTokens(userId: string) {
    const payload = this.createTokenPayload(userId);

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  // 페이로드 생성
  private createTokenPayload(userId: string) {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  // 토큰 검증
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async createAccessToken(payload: any) {
    const expiresIn = this.configService.get<string>("ACCESS_TOKEN_EXPIRY");
    return this.jwtService.sign(payload, { expiresIn });
  }

  async createRefreshToken(payload: any) {
    const expiresIn = this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
    return this.jwtService.sign(payload, { expiresIn });
  }
}
