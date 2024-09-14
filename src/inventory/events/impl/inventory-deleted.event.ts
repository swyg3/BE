import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class InventoryDeletedEvent implements BaseEvent{
  readonly eventType = "InventoryDeleted";
  readonly aggregateType = "Inventory";

  constructor(
    public readonly aggregateId: string, // aggregateId (number)
    public readonly data: {
      productId: string;
      deletedAt: Date; // 삭제 시각
    },
    public readonly version: number,
  ) {}
}
