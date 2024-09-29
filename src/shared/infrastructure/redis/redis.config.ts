import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

const logger = new Logger("RedisModule");

export const createRedisClient = (configService: ConfigService): Redis => {
  const redisOptions: RedisOptions = {
    host: configService.get("REDIS_HOST"),
    port: configService.get("REDIS_PORT"),
    connectTimeout: 10000, // 연결 시간 초과 설정 (밀리초)
    maxRetriesPerRequest: 3, // 요청 실패 시 최대 재시도 횟수
    retryStrategy: (times: number) => Math.min(times * 50, 2000), // 재시도 전략
  };

  const client = new Redis(redisOptions);

  // 에러 핸들러 등록
  client.on("error", (err) => {
    logger.error(`Redis Client Error: ${err.message}`);
  });

  // 연결 성공 시 로깅
  client.on("connect", () => {
    logger.log("Successfully connected to Redis");
  });

  // 연결이 준비 완료되었을 때 로깅
  client.on("ready", () => {
    logger.log("Redis Client is ready");
  });

  // 연결이 끊어졌을 때 로깅
  client.on("end", () => {
    logger.warn("Redis connection closed");
  });

  return client;
};

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: createRedisClient,
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
