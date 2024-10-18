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
  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const tempKey = `temp:${Date.now()}`;
    //this.logger.log(`Calculating distance between (${lat1}, ${lon1}) and (${lat2}, ${lon2})`);
    try {
      const addResult1 = await this.redis.geoadd(tempKey, lon1, lat1, 'point1');
      //this.logger.log(`Added point1: ${addResult1}`);
      const addResult2 = await this.redis.geoadd(tempKey, lon2, lat2, 'point2');
      //this.logger.log(`Added point2: ${addResult2}`);
      
      const distance = await this.redis.geodist(tempKey, 'point1', 'point2');
      // this.logger.log(`Raw distance: ${distance}`);
      const distanceInKm = parseFloat(distance); // m를 km로 변환
      return distanceInKm;
  
    } catch (error) {
      this.logger.error(`Error calculating distance: ${error.message}`);
      throw error;
    } finally {
      await this.redis.del(tempKey);
    }
  }
}
