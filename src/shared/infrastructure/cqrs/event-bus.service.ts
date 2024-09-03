import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventStoreService } from '../event-store/event-store.service';

@Injectable()
export class EventBusService {
  constructor(
    private readonly eventBus: EventBus,
    private readonly eventStoreService: EventStoreService
  ) {}

  async publishAndSave(event: any): Promise<void> {
    await this.eventStoreService.saveEvent({
      aggregateId: event.aggregateId,
      aggregateType: event.constructor.name,
      eventType: event.constructor.name,
      eventData: event,
      version: event.version,
    });

    this.eventBus.publish(event);
  }
}