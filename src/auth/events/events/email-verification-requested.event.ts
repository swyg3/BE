import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class EmailVerificationRequestedEvent implements BaseEvent {
  readonly eventType = "EmailVerificationRequested";
  readonly aggregateType = "User";

  constructor(
    public readonly aggregateId: string, 
    public readonly data: {
      email: string,
      verificationCode: string,
      expirationTime: Date,
    },
    public readonly version: number,
  ) {}
}