import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class CurrentLocationSetEvent implements BaseEvent {
  readonly eventType = "CurrentLocationSet";
  readonly aggregateType = "UserLocation";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      id:string;
      userId: string;
      updatedAt: Date;
    },
    public readonly version: number,
  ) {}
}