import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CurrentLocationSetEvent } from '../impl/location-set.event';
import { LocationViewRepository } from 'src/location/location-view.repository';
import { Logger } from '@nestjs/common';

@EventsHandler(CurrentLocationSetEvent)
export class CurrentLocationSetHandler implements IEventHandler<CurrentLocationSetEvent> {
  private readonly logger = new Logger(CurrentLocationSetHandler.name);

  constructor(
    private readonly locationViewRepository: LocationViewRepository,
  ) {}

  async handle(event: CurrentLocationSetEvent) {
    this.logger.log(`Handling CurrentLocationSetEvent for user: ${event.data.id}`);

    try {
      // LocationViewRepository의 메서드를 호출하여 현재 위치 업데이트
      await this.locationViewRepository.updateCurrentLocation(event.data.userId, event.data.id);
      this.logger.log(`Successfully updated current location for user: ${event.data.id}`);
    } catch (error) {
      this.logger.error(`Failed to update current location for user: ${event.data.id}`, error.stack);
      // 여기서 추가적인 에러 처리를 할 수 있습니다.
    }
  }
}