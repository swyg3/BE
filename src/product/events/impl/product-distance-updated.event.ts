import { BaseEvent } from "src/shared/infrastructure/event-sourcing/interfaces/base-event.interface";

export class ProductDistanceUpdatedEvent implements BaseEvent {
  public readonly aggregateType = 'Product';
  public readonly eventType = 'ProductDistanceUpdated';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      distance: number;
      distanceDiscountScore: number;
    },
    public readonly version: number
  ) {
   
  }
}