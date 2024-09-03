import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const createRedisClient = (configService: ConfigService): Redis => {
  return new Redis({
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  });
};