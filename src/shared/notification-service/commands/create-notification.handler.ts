import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateNotificationCommand } from './create-notification.command';
import { NotificationViewRepository } from '../notification.repository';
import { EventBusService } from 'src/shared/infrastructure/event-sourcing/event-bus.service';

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler
  implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    private readonly notificationRepository: NotificationViewRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: CreateNotificationCommand) {
    const { userId, message } = command;
  }
}