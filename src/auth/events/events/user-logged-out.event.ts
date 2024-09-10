import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserLoggedOutEvent implements BaseEvent {
  readonly eventType = "UserLoggedOut";
  readonly aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      timestamp: Date;
    },
    public readonly version: number,
  ) {}
}