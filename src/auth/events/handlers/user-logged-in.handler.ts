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
    this.logger.log(`사용자 로그인 이벤트 처리: userId=${event.aggregateId}`);
    this.logger.log(
      `이벤트 핸들러에서 수신한 데이터: ${JSON.stringify(event)}`,
    );

    const updateData = {
      lastLoginAt: new Date(),
      email: event.data.email, // 추가
      name: event.data.name, // 추가
      phoneNumber: event.data.phoneNumber, // 추가
      isEmailVerified: event.data.isEmailVerified, // 추가
    };
    this.logger.log(`updateData: ${updateData}`);
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
