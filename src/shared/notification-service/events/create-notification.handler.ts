import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationCreatedEvent } from './create-notification.event';


@EventsHandler(NotificationCreatedEvent)
export class NotificationCreatedHandler
  implements IEventHandler<NotificationCreatedEvent> {
  handle(event: NotificationCreatedEvent) {
    // 예: 알림 생성
    console.log(`Notification created: ${event.aggregateId}`);
  }
}