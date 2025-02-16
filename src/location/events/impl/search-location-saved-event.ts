import { BaseEvent } from "src/shared/infrastructure/event-sourcing";


export class SearchLocationSavedEvent implements BaseEvent {
  readonly eventType = "SearchLocationSaved";
  readonly aggregateType = "UserLocation";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      userId: string;
      searchTerm: string;
      roadAddress: string;
      latitude: string;
      longitude: string;
      isCurrent: boolean;
      isAgreed: boolean;
      updatedAt: Date;
      // 새로 추가된 필드
    },
    public readonly version: number,
  ) { }
}