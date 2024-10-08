import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { UserLocationSavedEvent } from "../impl/location-save-event";
import { LocationView2, LocationViewRepository } from "src/location/location-view.repository";

@EventsHandler(UserLocationSavedEvent)
export class UserLocationSavedHandler
  implements IEventHandler<UserLocationSavedEvent> {
  private readonly logger = new Logger(UserLocationSavedHandler.name);

  constructor(
    private readonly locationViewRepository: LocationViewRepository,
  ) { }

  async handle(event: UserLocationSavedEvent) {
    this.logger.log(`UserLocationSavedEvent 처리중: ${event.aggregateId}`);

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

      await this.locationViewRepository.create(locationView);


      this.logger.log(`UserLocationView 등록 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `UserLocationView 등록 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
