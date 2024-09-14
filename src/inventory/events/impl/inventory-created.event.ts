import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class InventoryCreatedEvent implements BaseEvent {
  readonly eventType = "InventoryCreated";
  readonly aggregateType = "Inventory";

  constructor(
    public readonly aggregateId: string, // aggregateId (number)
    public readonly data: {
      productId: string;
      quantity: number;
      expirationDate: Date;
      updatedAt: Date;
    },
    public readonly version: number,
  ) {}
}
