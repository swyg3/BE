import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateNotificationCommand } from "./update-notification.command";
import {
  NotificationView,
  NotificationViewRepository,
} from "../notification.repository";
import { Logger, NotFoundException } from "@nestjs/common";

@CommandHandler(UpdateNotificationCommand)
export class UpdateNotificationHandler
  implements ICommandHandler<UpdateNotificationCommand>
{
  private readonly logger = new Logger(UpdateNotificationHandler.name);

  constructor(
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async execute(command: UpdateNotificationCommand): Promise<void> {
    const { userId, messageId } = command;
    this.logger.log(
      `알림 읽음 처리 시도: userId=${userId}, messageId=${messageId}`,
    );

    const notification =
      await this.notificationViewRepository.findByMessageId(messageId);

    if (!notification) {
      throw new NotFoundException("알림을 찾을 수 없습니다.");
    }

    if (notification.isRead) {
      this.logger.log(`알림이 이미 읽음 상태입니다: messageId=${messageId}`);
      return;
    }

    const updateData: Partial<NotificationView> = {
      isRead: true,
    };

    await this.notificationViewRepository.update(messageId, updateData);
    this.logger.log(`알림 읽음 처리 성공: messageId=${messageId}`);
  }
}
