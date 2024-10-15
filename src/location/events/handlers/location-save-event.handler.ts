import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLocationSavedEvent } from "../impl/location-save-event";
import { Logger } from "@nestjs/common";
import { LocationView2, LocationViewRepository } from "src/location/repositories/location-view.repository";
import { LocationResultCache } from "src/location/caches/location-cache";
import { LocationResultCache2 } from "src/location/caches/location-cache2";

@EventsHandler(UserLocationSavedEvent)
export class UserLocationSavedHandler implements IEventHandler<UserLocationSavedEvent> {
  private readonly logger = new Logger(UserLocationSavedHandler.name);

  constructor(
    private readonly locationViewRepository: LocationViewRepository,
    private readonly cache: LocationResultCache2
  ) { }

  async handle(event: UserLocationSavedEvent) {
    this.logger.log(`UserLocationSavedEvent 처리중: ${event.aggregateId}`);
    const cacheKey = this.generateCacheKey(event.data.userId);

    try {
      const locationView: LocationView2 = {
        locationId: event.aggregateId,
        userId: event.data.userId,
        searchTerm: event.data.searchTerm,
        roadAddress: event.data.roadAddress,
        latitude: event.data.latitude,
        longitude: event.data.longitude,
        isCurrent: event.data.isCurrent,
        isAgreed: event.data.isAgreed,
        updatedAt: event.data.updatedAt || new Date(),
      };
      // 순차적으로 데이터베이스 작업 수행
      await this.locationViewRepository.setAllLocationsToFalse(event.data.userId);
      const createdLocation = await this.locationViewRepository.create(locationView);

      await this.safeSetCache(cacheKey, createdLocation);

      // 데이터베이스 작업이 성공적으로 완료된 후 캐시 업데이트
      await this.safeSetCache(cacheKey, locationView); 

      this.logger.log(`UserLocationView 등록 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `UserLocationView 등록 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
      await this.safeSetCache(cacheKey, null);
    }
  }

  private generateCacheKey(userId: string): string {
    return `location:${userId}`;
  }

  private async safeSetCache(key: string, value: any): Promise<void> {
    try {
      await this.cache.set(key, value, 60);
    } catch (cacheError) {
      this.logger.error(`캐시 설정 실패: ${key}, ${cacheError.message}`, cacheError.stack);
      // 캐시 설정 실패를 무시하고 계속 진행
    }
  }
}