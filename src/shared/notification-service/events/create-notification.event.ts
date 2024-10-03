import { BaseEvent } from "src/shared/infrastructure/event-sourcing/interfaces/base-event.interface";

export class NotificationCreatedEvent implements BaseEvent {
  public readonly eventType = 'NotificationCreated';
  public readonly aggregateType = 'Notification';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
        userId: string,
        message: string
      },
      public readonly version: number,
    ) {}
}
