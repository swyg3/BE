import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerProfileCompletedEvent implements BaseEvent {
  readonly eventType = "SellerProfileCompleted";
  readonly aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: any,
    public readonly version: number,
  ) {}
}