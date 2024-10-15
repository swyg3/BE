import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLocationSavedEvent } from "../impl/location-save-event";
import { Logger } from "@nestjs/common";
import { LocationView2, LocationViewRepository } from "src/location/repositories/location-view.repository";
import { LocationResultCache } from "src/location/caches/location-cache";
import { LocationResultCache2 } from "src/location/caches/location-cache2";
import { SearchLocationSavedEvent } from "../impl/search-location-saved-event";
import { LocationSearchCache } from "src/location/caches/location-cache.search";

@EventsHandler(SearchLocationSavedEvent)
export class SearchLocationSavedHandler implements IEventHandler<SearchLocationSavedEvent> {
  private readonly logger = new Logger(SearchLocationSavedHandler.name);

  constructor(
    private readonly locationViewRepository: LocationViewRepository,
    private readonly searchcache: LocationSearchCache,
  ) { }

  async handle(event: SearchLocationSavedEvent) {
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
      
      const createdLocation = await this.locationViewRepository.create(locationView);

      await this.searchcache.set(cacheKey, createdLocation, 300);
      const cachedValue = await this.searchcache.get(cacheKey);
      
      if (cachedValue) {
        this.logger.log(`캐시 설정 성공: ${cacheKey}`);
      } else {
        this.logger.warn(`캐시 설정 실패: ${cacheKey}`);
      }

      this.logger.log(`UserLocationView 등록 성공: ${event.aggregateId}`);
    } catch (error) {
        this.searchcache.set(cacheKey, null, 60);
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
      await this.searchcache.set(key, value,  300);
    } catch (cacheError) {
      this.logger.error(`캐시 설정 실패: ${key}, ${cacheError.message}`, cacheError.stack);
      // 캐시 설정 실패를 무시하고 계속 진행
    }
  }
}