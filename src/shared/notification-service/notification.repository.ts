import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { SortOrder } from "dynamoose/dist/General";

export interface NotificationView {
  messageId: string;
  userId: string;
  message: string;
  type: string;
  isRead: boolean;
}

@Injectable()
export class NotificationViewRepository {
  private readonly logger = new Logger(NotificationViewRepository.name);

  constructor(
    @InjectModel("NotificationView")
    private readonly notificationViewModel: Model<
      NotificationView,
      { messageId: string }
    >,
  ) {}

  async create(notificationView: NotificationView): Promise<NotificationView> {
    try {
      this.logger.log(`NotificationView 생성: ${notificationView.messageId}`);
      return await this.notificationViewModel.create(notificationView);
    } catch (error) {
      this.logger.error(
        `NotificationView 생성 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByMessageId(messageId: string): Promise<NotificationView | null> {
    return await this.notificationViewModel.get({ messageId });
  }

  async findLatestByUserId(
    userId: string,
    limit: number,
  ): Promise<NotificationView[]> {
    return await this.notificationViewModel
      .query("userId")
      .eq(userId)
      .sort(SortOrder.descending)
      .limit(limit)
      .exec();
  }

  async update(
    messageId: string,
    updates: Partial<NotificationView>,
  ): Promise<NotificationView | null> {
    try {
      this.logger.log(`NotificationView 업데이트: messageId=${messageId}`);
      const updatedNotification = await this.notificationViewModel.update(
        { messageId },
        updates,
        { return: "item" },
      );
      this.logger.log(
        `NotificationView 업데이트 성공: ${JSON.stringify(updatedNotification)}`,
      );
      return updatedNotification;
    } catch (error) {
      this.logger.error(
        `NotificationView 업데이트 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    this.logger.log(
      `사용자의 모든 NotificationView 삭제 시도: userId=${userId}`,
    );

    try {
      let lastEvaluatedKey = null;
      do {
        // 사용자의 알림을 25개씩 조회
        const queryResult = await this.notificationViewModel
          .query("userId")
          .eq(userId)
          .startAt(lastEvaluatedKey)
          .limit(25)
          .exec();

        if (queryResult.length === 0) {
          break;
        }

        // 삭제할 항목 준비
        const deleteItems = queryResult.map((item) => ({
          messageId: item.messageId,
        }));

        // batchDelete 실행
        await this.notificationViewModel.batchDelete(deleteItems);

        this.logger.log(`${deleteItems.length}개의 알림 삭제 완료`);

        lastEvaluatedKey = queryResult.lastKey;
      } while (lastEvaluatedKey);

      this.logger.log(
        `사용자의 모든 NotificationView 삭제 완료: userId=${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `NotificationView 삭제 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
