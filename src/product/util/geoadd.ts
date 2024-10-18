import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';

@Injectable()
export class RedisGeo {
  private readonly logger = new Logger(RedisGeo.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async addLocation(productId: string, latitude: number, longitude: number): Promise<number> {
    try {
      return await this.redis.geoadd('product_locations', longitude, latitude, productId);
    } catch (error) {
      this.logger.error(`Error adding location: ${error.message}`);
      throw error;
    }
  }
  async calculateDistance(
    userLatitude: number,
    userLongitude: number,
    locations: { id: string; latitude: number; longitude: number; }[]
  ): Promise<{ id: string; distance: string; }[]> {
    const tempKey = `temp:${Date.now()}`;
    try {
      await this.redis.geoadd(tempKey, userLongitude, userLatitude, 'user');
      
      const pipeline = this.redis.pipeline();
      for (const location of locations) {
        pipeline.geoadd(tempKey, location.longitude, location.latitude, location.id);
        pipeline.geodist(tempKey, 'user', location.id); // 단위를 지정하지 않음
      }
      
      const results = await pipeline.exec();
      
      return locations.map((location, index) => ({
        id: location.id,
        distance: results[index * 2 + 1][1] as string
      }));
    } finally {
      await this.redis.del(tempKey);
    }
  }
}
