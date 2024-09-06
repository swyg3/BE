import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventStoreService } from '../event-store/event-store.service';

interface EventWithMetadata {
  aggregateId: string;
  version: number;
  [key: string]: any;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly eventStoreService: EventStoreService
  ) {}

  async publishAndSave(event: EventWithMetadata): Promise<void> {
    try {
      await this.eventStoreService.saveEvent({
        aggregateId: event.aggregateId,
        aggregateType: this.getAggregateType(event),
        eventType: event.constructor.name,
        eventData: event,
        version: event.version,
      });

      this.eventBus.publish(event);
      this.logger.log(`이벤트 발행 및 저장 성공: ${event.constructor.name}`);
    } catch (error) {
      this.logger.error(`이벤트 발행 및 저장 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getAggregateType(event: EventWithMetadata): string {
    return event.constructor.name.replace('Event', '');
  }
}