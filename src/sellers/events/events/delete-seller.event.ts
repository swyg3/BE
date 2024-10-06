import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerDeletedEvent implements BaseEvent {
  eventType = "SellerDeleted";
  aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: object = {},
    public readonly version: number,
  ) {}
}
