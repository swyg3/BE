import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

export interface TokenPayload {
  sub: string;
  email: string;
  userType: string;
  iat: number;
  jti: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(userId: string, email: string, userType: string) {
    const accessTokenPayload = this.createTokenPayload(userId, email, userType);
    const refreshTokenPayload = this.createTokenPayload(
      userId,
      email,
      userType,
    );

    const [accessTokenData, refreshTokenData] = await Promise.all([
      this.createAccessToken(accessTokenPayload),
      this.createRefreshToken(refreshTokenPayload),
    ]);

    return { 
      accessToken: accessTokenData.token, 
      refreshToken: refreshTokenData.token,
      accessTokenExpiresIn: accessTokenData.expiresIn,
      refreshTokenExpiresIn: refreshTokenData.expiresIn
     };
  }

  private createTokenPayload(
    userId: string,
    email: string,
    userType: string,
  ): TokenPayload {
    return {
      sub: userId,
      email,
      userType,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }
  }

  async createAccessToken(payload: TokenPayload): Promise<{ token: string; expiresIn: number }> {
    const expiresIn = this.configService.get<string>("ACCESS_TOKEN_EXPIRY");
    this.logger.debug(`ACCESS_TOKEN_EXPIRY: ${expiresIn}`);
    if (!expiresIn) {
      throw new Error("ACCESS_TOKEN_EXPIRY is not set in the environment");
    }
    const token = await this.jwtService.sign(payload, { expiresIn });
    return { token, expiresIn: this.parseExpiresIn(expiresIn) };
  }

  async createRefreshToken(payload: TokenPayload): Promise<{ token: string; expiresIn: number }> {
    const expiresIn = this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
    if (!expiresIn) {
      throw new Error("REFRESH_TOKEN_EXPIRY is not set in the environment");
    }
    const token = await this.jwtService.sign(payload, { expiresIn });
    return { token, expiresIn: this.parseExpiresIn(expiresIn) };
  }

  // ex. '3d' -> 259200 (3일을 초로 변환)
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}
