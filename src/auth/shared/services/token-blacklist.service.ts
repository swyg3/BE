import { Injectable, Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  // 블랙리스트 추가
  async addToBlacklist(
    token: string,
    type: "access" | "refresh",
  ): Promise<void> {
    const key = `blacklist:${type}:${token}`;
    const expirationTime = type === "access" ? 3600 : 604800; // 1시간 또는 7일
    await this.redisClient.set(key, "1", "EX", expirationTime);
  }

  // 블랙리스트 확인
  async isBlacklisted(
    token: string,
    type: "access" | "refresh",
  ): Promise<boolean> {
    const key = `blacklist:${type}:${token}`;
    const result = await this.redisClient.get(key);
    return result === "1";
  }
}
