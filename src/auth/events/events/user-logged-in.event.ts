import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UserLoggedInEvent implements BaseEvent {
  readonly eventType = "UserLoggedIn";
  readonly aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      provider: string;
      email: string;
      name: string;
      phoneNumber: string;
      isNewUser: boolean;
      isEmailVerified: boolean;
      timestamp: Date;
    },
    public readonly version: number,
  ) {}
}
