import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class InventoryUpdatedEvent implements BaseEvent {
  readonly eventType = "InventoryUpdated";
  readonly aggregateType = "Inventory";

  constructor(
    public readonly aggregateId: string, // aggregateId (number)
    public readonly data: {
      productId: string;
      quantity?: number;
      expirationDate?: Date;
      updatedAt: Date; // 업데이트 시각
    },
    public readonly version: number,
  ) {}
}
