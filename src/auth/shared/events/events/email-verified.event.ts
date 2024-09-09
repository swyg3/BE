import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class EmailVerifiedEvent implements BaseEvent {
  eventType = "EmailVerified";
  aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: { email: string },
    public readonly version: number,
  ) {}
}
