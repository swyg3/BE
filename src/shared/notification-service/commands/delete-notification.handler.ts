import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNotificationCommand } from './delete-notification.command';
import { NotificationViewRepository } from '../notification.repository';
import { EventBusService } from 'src/shared/infrastructure/event-sourcing';

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationHandler implements ICommandHandler<DeleteNotificationCommand> {
  constructor(
    private readonly notificationRepository: NotificationViewRepository,
    private readonly eventBusService: EventBusService
  ) {}

  async execute(command: DeleteNotificationCommand) {
    const { id } = command;
    
  }
}