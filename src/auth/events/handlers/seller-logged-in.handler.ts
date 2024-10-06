import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SellerLoggedInEvent } from "../events/seller-logged-in.event";
import { Logger } from "@nestjs/common";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";
import { v4 as uuidv4 } from "uuid";
import { NotificationViewRepository } from "src/shared/notification-service/notification.repository";

@EventsHandler(SellerLoggedInEvent)
export class SellerLoggedInEventHandler
  implements IEventHandler<SellerLoggedInEvent>
{
  private readonly logger = new Logger(SellerLoggedInEventHandler.name);

  constructor(
    private sellerViewRepository: SellerViewRepository,
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async handle(event: SellerLoggedInEvent) {
    this.logger.log(`판매자 로그인 이벤트 처리: sellerId=${event.aggregateId}`);
    this.logger.log(
      `이벤트 핸들러에서 수신한 데이터: ${JSON.stringify(event)}`,
    );

    const updateData = {
      lastLoginAt: new Date(),
      email: event.data.email,
      name: event.data.name,
      phoneNumber: event.data.phoneNumber,
      isEmailVerified: event.data.isEmailVerified,
      storeName: event.data.storeName,
      storeAddress: event.data.storeAddress,
      storePhoneNumber: event.data.storePhoneNumber,
      isBusinessVerified: event.data.isBusinessNumberVerified,
      agreeReceiveLocation: event.data.agreeReceiveLocation,
    };
    this.logger.log(`updateData: ${updateData}`);

    // DynamoDB에서 로그인 시간 업데이트
    const updatedSeller = await this.sellerViewRepository.update(
      event.aggregateId,
      updateData,
    );

    this.logger.log(
      `로그인 이벤트 처리 완료: sellerId=${event.aggregateId}, 마지막 로그인 시간: ${updatedSeller.lastLoginAt}`,
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
