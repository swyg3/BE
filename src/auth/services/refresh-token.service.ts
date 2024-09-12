import { Injectable, Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    const expiryTime = this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
    const seconds = parseDuration(expiryTime);
    if (isNaN(seconds) || seconds <= 0) {
      throw new Error("유효하지 않은 만료 시간 설정");
    }
    await this.redisClient.set(key, refreshToken, "EX", seconds);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return this.redisClient.get(key);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisClient.del(key);
  }

  async addToBlacklist(token: string, expirationTime: string): Promise<void> {
    if (!token) {
      throw new Error("유효하지 않은 토큰");
    }

    const key = `blacklist:${token}`;
    const expiryTime = this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
    const seconds = parseDuration(expiryTime);
    if (isNaN(seconds) || seconds <= 0) {
      throw new Error("유효하지 않은 블랙리스트 만료 시간 설정");
    }
    await this.redisClient.set(key, "1", "EX", seconds);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!token) {
      throw new Error("유효하지 않은 토큰");
    }
    const key = `blacklist:${token}`;
    const result = await this.redisClient.get(key);
    return result === "1";
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return NaN;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return NaN;
  }
}
