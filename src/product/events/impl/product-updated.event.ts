import { BaseEvent } from "src/shared/infrastructure/event-sourcing/interfaces/base-event.interface";

export class ProductUpdatedEvent implements BaseEvent {
  readonly eventType = "ProductUpdated";
  readonly aggregateType = "Product";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      name?: string;
      productImageUrl?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
      discountRate?: number;
      availableStock?: number;
      expirationDate?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    },
    public readonly version: number,
  ) {}
}
