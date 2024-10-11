import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CurrentLocationSetEvent } from '../impl/location-set.event';
import { Logger } from '@nestjs/common';
import { LocationViewRepository } from 'src/location/repositories/location-view.repository';
import { LocationResultCache } from 'src/location/caches/location-cache';

@EventsHandler(CurrentLocationSetEvent)
export class CurrentLocationSetHandler implements IEventHandler<CurrentLocationSetEvent> {
  private readonly logger = new Logger(CurrentLocationSetHandler.name);

  constructor(
    private readonly locationViewRepository: LocationViewRepository,
    private readonly cache: LocationResultCache
  ) {}

  async handle(event: CurrentLocationSetEvent) {
    this.logger.log(`Handling CurrentLocationSetEvent for user: ${event.data.userId}`);
    const cacheKey = `${event.data.userId}:${event.data.id}`;

    try {
      const updatedLocation = await this.locationViewRepository.updateCurrentLocation(event.data.userId, event.data.id);
      this.logger.log(`Successfully updated current location for user: ${event.data.userId}`);
      this.cache.set(cacheKey, updatedLocation);
    } catch (error) {
      this.logger.error(`Failed to update current location for user: ${event.data.userId}`, error.stack);
      this.cache.set(cacheKey, null);
    }
  }
}