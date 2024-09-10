import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class TokenRefreshedEvent implements BaseEvent {
  readonly eventType = "TokenRefreshed";
  readonly aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      userId: string,
      newAccessToken: string,
    },
    public readonly version: number,
  ) {}
}