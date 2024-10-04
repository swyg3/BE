import { LocationType } from "src/location/location.type";
import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserLocationSavedEvent implements BaseEvent {
  readonly eventType = "UserLocationSaved";
  readonly aggregateType = "UserLocation";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      userId: string;
      latitude: string;
      longitude: string;
      isCurrent: boolean;
      locationType: LocationType;
      isAgreed: boolean;
      updatedAt: Date;
    },
    public readonly version: number,
  ) { }
}