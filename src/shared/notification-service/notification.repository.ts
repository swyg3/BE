import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Condition } from "dynamoose/dist/Condition";

export interface NotificationView {
  messageId: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable()
export class NotificationViewRepository {
  private readonly logger = new Logger(NotificationViewRepository.name);

  constructor(
    @InjectModel('NotificationView')
    private readonly notificationViewModel: Model<NotificationView, { notificationId: string }>
  ) {}

  async create(notificationView: NotificationView): Promise<NotificationView> {
    try {
      this.logger.log(`NotificationView 생성: ${notificationView.messageId}`);
      return await this.notificationViewModel.create(notificationView);
    } catch (error) {
      this.logger.error(`NotificationView 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByNotificationId(notificationId: string): Promise<NotificationView | null> {
    try {
      this.logger.log(`NotificationView 조회: notificationId=${notificationId}`);
      return await this.notificationViewModel.get({ notificationId });
    } catch (error) {
      this.logger.error(`NotificationView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<NotificationView[]> {
    try {
      this.logger.log(`NotificationView 조회: userId=${userId}`);
      return await this.notificationViewModel.query('userId').eq(userId).exec();
    } catch (error) {
      this.logger.error(`NotificationView 조회 실패: ${error.message}`, error.stack);
      return [];
    }
  }

  async update(
    notificationId: string, 
    updates: Partial<NotificationView>
  ): Promise<NotificationView | null> {
    try {
      this.logger.log(`NotificationView 업데이트: notificationId=${notificationId}`);
      const updatedNotification = await this.notificationViewModel.update(
        { notificationId: notificationId }, 
        updates, 
        { return: 'item' }
      );
      this.logger.log(`NotificationView 업데이트 성공: ${updatedNotification}`);
      return updatedNotification;
    } catch (error) {
      this.logger.error(`NotificationView 업데이트 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationView | null> {
    return this.update(
      notificationId, 
      { 
        isRead: true,
        updatedAt: new Date()
      }
    );
  }

  async findOneAndUpdate(
    notificationId: string,
    notificationView: Partial<NotificationView>
  ): Promise<{ notificationView: NotificationView; isNewNotificationView: boolean }> {
    this.logger.log(`NotificationView Upsert 시도: notificationId=${notificationId}`);

    try {
      const condition = new Condition().attribute('notificationId').exists();
      const updatedNotification = await this.notificationViewModel.update(
        { notificationId },
        notificationView,
        {
          return: 'item',
          condition: condition
        }
      );
      return { notificationView: updatedNotification, isNewNotificationView: false };
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        const newNotificationView = await this.create({ 
          notificationId, 
          ...notificationView
        } as NotificationView);
        return { notificationView: newNotificationView, isNewNotificationView: true };
      }
      this.logger.error(`NotificationView Upsert 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(notificationId: string): Promise<void> {
    this.logger.log(`NotificationView 삭제 시도: notificationId=${notificationId}`);

    try {
      await this.notificationViewModel.delete({ notificationId });
      this.logger.log(`NotificationView 삭제 성공: notificationId=${notificationId}`);
    } catch (error) {
      this.logger.error(`NotificationView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteAllForUser(userId: string): Promise<void> {
    this.logger.log(`사용자의 모든 NotificationView 삭제 시도: userId=${userId}`);

    try {
      const notifications = await this.findByUserId(userId);
      await Promise.all(notifications.map(notification => 
        this.delete(notification.messageId)
      ));
      this.logger.log(`사용자의 모든 NotificationView 삭제 성공: userId=${userId}`);
    } catch (error) {
      this.logger.error(`사용자의 모든 NotificationView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
}