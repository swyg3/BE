import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerLoggedOutEvent implements BaseEvent {
  readonly eventType = "SellerLoggedOut";
  readonly aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      timestamp: Date;
    },
    public readonly version: number,
  ) {}
}