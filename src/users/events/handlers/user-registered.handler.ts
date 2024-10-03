import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../events/user-registered.event";
import { Logger } from "@nestjs/common";
import { UserViewRepository } from "src/users/repositories/user-view.repository";
import { NotificationViewRepository } from "src/shared/notification-service/notification.repository";
import { v4 as uuidv4 } from "uuid";

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler
  implements IEventHandler<UserRegisteredEvent>
{
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(
    private readonly userViewRepository: UserViewRepository,
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async handle(event: UserRegisteredEvent) {
    this.logger.log(`UserRegisteredEvent 처리중: ${event.aggregateId}`);

    try {
      await this.userViewRepository.create({
        userId: event.aggregateId,
        email: event.data.email,
        name: event.data.name,
        phoneNumber: event.data.phoneNumber,
        isEmailVerified: event.data.isEmailVerified,
      });
    } catch (error) {
      this.logger.error(
        `Users-View 업데이트 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }

    // 가입 환영 알림 생성
    try {
      await this.notificationViewRepository.create({
        messageId: uuidv4(),
        userId: event.aggregateId,
        type: "WELCOME",
        message: `환영합니다, ${event.data.name}님!`,
        isRead: false,
      });
    } catch (error) {
      this.logger.error(
        `환영 알림 생성 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
