import { Injectable, Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    const expiryTime = this.configService.get<number>('REFRESH_TOKEN_EXPIRY');
    await this.redisClient.set(key, refreshToken, 'EX', expiryTime);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return this.redisClient.get(key);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisClient.del(key);
  }

  // 블랙리스트 추가
  async addToBlacklist(token: string, expirationTime: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.redisClient.set(key, "1", "EX", expirationTime);
  }

  // 블랙리스트 확인
  async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const result = await this.redisClient.get(key);
    return result === "1";
  }
}
