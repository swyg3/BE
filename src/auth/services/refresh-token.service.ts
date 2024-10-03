import { Injectable, Inject, Logger } from "@nestjs/common";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

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
    this.logger.log(`리프레시 토큰 저장: ${userId}`);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    const token = await this.redisClient.get(key);
    this.logger.log(`리프레시 토큰 조회: ${userId}`);
    return token;
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisClient.del(key);
    this.logger.log(`리프레시 토큰 삭제: ${userId}`);
  }

  async addToBlacklist(token: string): Promise<void> {
    const key = `blacklist:${token}`;
    const expiryTime = this.configService.get<string>(
      "REFRESH_TOKEN_BLACKLIST_EXPIRY",
    );
    const seconds = parseDuration(expiryTime);
    if (isNaN(seconds) || seconds <= 0) {
      throw new Error("유효하지 않은 블랙리스트 만료 시간 설정");
    }
    try {
      await this.redisClient.set(key, "1", "EX", seconds);
      this.logger.log(`Token added to blacklist`);
    } catch (error) {
      this.logger.error(`Failed to add token to blacklist: ${error.message}`);
      throw new Error("토큰 블랙리스트 추가 실패");
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    try {
      const result = await this.redisClient.get(key);
      return result === "1";
    } catch (error) {
      this.logger.error(`Failed to check blacklist status: ${error.message}`);
      throw new Error("블랙리스트 확인 실패");
    }
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
