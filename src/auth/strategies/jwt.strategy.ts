import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { RefreshTokenService } from "../services/refresh-token.service";
import { Request } from "express";

interface JwtPayload {
  sub: string;
  email: string;
  userType: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);

    if (!token) {
      this.logger.warn("토큰이 제공되지 않았습니다.");
      throw new UnauthorizedException("토큰이 제공되지 않았습니다.");
    }

    const isBlacklisted = await this.refreshTokenService.isBlacklisted(token);

    if (isBlacklisted) {
      this.logger.warn(`Blacklisted token used: ${token}`);
      throw new UnauthorizedException("토큰이 취소되었습니다.");
    }

    if (!payload.sub || !payload.email || !payload.userType) {
      this.logger.warn(
        `유효하지 않은 토큰 페이로드: ${JSON.stringify(payload)}`,
      );
      throw new UnauthorizedException("유효하지 않은 토큰 페이로드입니다.");
    }

    this.logger.log(`User authenticated: ${payload.email}`);

    return {
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
      accessToken: token,
    };
  }
}
