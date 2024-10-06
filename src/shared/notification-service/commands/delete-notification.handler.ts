import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteNotificationCommand } from "./delete-notification.command";
import { NotificationViewRepository } from "../notification.repository";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Logger } from "@nestjs/common";

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationHandler
  implements ICommandHandler<DeleteNotificationCommand>
{
  private readonly logger = new Logger(DeleteNotificationHandler.name);

  constructor(
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async execute(command: DeleteNotificationCommand): Promise<void> {
    const { userId } = command;

    this.logger.log(`DeleteNotificationCommand 실행: userId=${userId}`);
    await this.notificationViewRepository.deleteAllByUserId(userId);
  }
}
