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

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(accessTokenPayload),
      this.createRefreshToken(refreshTokenPayload),
    ]);

    return { accessToken, refreshToken };
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

  async createAccessToken(payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>("ACCESS_TOKEN_EXPIRY");
    this.logger.debug(`ACCESS_TOKEN_EXPIRY: ${expiresIn}`);
    if (!expiresIn) {
      throw new Error("ACCESS_TOKEN_EXPIRY is not set in the environment");
    }
    return this.jwtService.sign(payload, { expiresIn });
  }

  async createRefreshToken(payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
    if (!expiresIn) {
      throw new Error("REFRESH_TOKEN_EXPIRY is not set in the environment");
    }
    return this.jwtService.sign(payload, { expiresIn });
  }
}
