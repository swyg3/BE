import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserDeletedEvent implements BaseEvent {
  eventType = "UserDeleted";
  aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: object = {},
    public readonly version: number,
  ) {}
}
