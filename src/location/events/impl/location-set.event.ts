import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class CurrentLocationSetEvent implements BaseEvent {
  readonly eventType = "CurrentLocationSet";
  readonly aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      userId: string;
      locationId: string;
      updatedAt: Date;
    },
    public readonly version: number,
  ) {}
}