import { BaseEvent } from "src/shared/infrastructure/event-sourcing/interfaces/base-event.interface";

export class ProductDeletedEvent implements BaseEvent {
  readonly eventType = "ProductDeleted";
  readonly aggregateType = "Product";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      updatedAt: Date;
    },
    public readonly version: number,
  ) {}
}
