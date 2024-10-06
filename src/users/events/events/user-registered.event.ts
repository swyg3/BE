import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserRegisteredEvent implements BaseEvent {
  eventType = "UserRegistered";
  aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      email: string;
      name: string;
      phoneNumber: string;
      isEmailVerified: boolean;
      agreeReceiveLocation: boolean;
    },
    public readonly version: number,
  ) {}
}
