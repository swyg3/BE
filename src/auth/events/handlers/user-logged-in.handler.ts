import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLoggedInEvent } from "../events/user-logged-in.event";
import { Logger } from "@nestjs/common";
import { UserViewRepository } from "src/users/repositories/user-view.repository";
import { v4 as uuidv4 } from "uuid";
import { NotificationViewRepository } from "src/shared/notification-service/notification.repository";

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler
  implements IEventHandler<UserLoggedInEvent>
{
  private readonly logger = new Logger(UserLoggedInEventHandler.name);

  constructor(
    private userViewRepository: UserViewRepository,
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async handle(event: UserLoggedInEvent) {

    const updateData = {
      lastLoginAt: new Date(),
      email: event.data.email,
      name: event.data.name,
      phoneNumber: event.data.phoneNumber,
      isEmailVerified: event.data.isEmailVerified,
      agreeReceiveLocation: event.data.agreeReceiveLocation,
    };

    // DynamoDB에서 로그인 시간 업데이트
    const updatedUser = await this.userViewRepository.update(
      event.aggregateId,
      updateData,
    );

    this.logger.log(
      `로그인 이벤트 처리 완료: userId=${event.aggregateId}, 마지막 로그인 시간: ${updatedUser.lastLoginAt}`,
    );

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
