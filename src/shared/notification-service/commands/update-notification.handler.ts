import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNotificationCommand } from './update-notification.command';
import { NotificationViewRepository } from '../notification.repository';
import { EventBusService } from 'src/shared/infrastructure/event-sourcing';

@CommandHandler(UpdateNotificationCommand)
export class UpdateNotificationHandler implements ICommandHandler<UpdateNotificationCommand> {
  constructor(
    private readonly notificationRepository: NotificationViewRepository,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: UpdateNotificationCommand) {
    const { id, message, isRead } = command;
  }
}
