import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Condition } from "dynamoose/dist/Condition";

export interface UserView {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  agreeReceiveLocation: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

@Injectable()
export class UserViewRepository {
  private readonly logger = new Logger(UserViewRepository.name);

  constructor(
    @InjectModel('UserView')
    private readonly userViewModel: Model<UserView, { userId: string }>
  ) {}

  async create(userView: UserView): Promise<UserView> {
    try {
      this.logger.log(`UserView 생성: ${userView.userId}`);
      return await this.userViewModel.create(userView);
    } catch (error) {
      this.logger.error(`UserView 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<UserView | null> {
    try {
      this.logger.log(`UserView 조회: userId=${userId}`);
      return await this.userViewModel.get({ userId });
    } catch (error) {
      this.logger.error(`UserView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserView | null> {
    try {
      this.logger.log(`UserView 조회: email=${email}`);
      const results = await this.userViewModel.query('email').eq(email).exec();
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.error(`UserView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async update(userId: string, updates: Partial<UserView>): Promise<UserView | null> {
    try {
      this.logger.log(`UserView 업데이트: userId=${userId}`);
      const updatedUser = await this.userViewModel.update(
        { userId: userId}, 
        updates, 
        { return: 'item'}
      );
      this.logger.log(`UserView 업데이트 성공`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`UserView 업데이트 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async delete(userId: string): Promise<void> {
    this.logger.log(`UserView 삭제 시도: userId=${userId}`);

    try {
      await this.userViewModel.delete({ userId });
      this.logger.log(`UserView 삭제 성공: userId=${userId}`);
    } catch (error) {
      this.logger.error(`UserView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async findOneAndUpdate(
    userId: string,
    userView: Partial<UserView>
  ): Promise<{ userView: UserView; isNewUserView: boolean }> {
    this.logger.log(`UserView Upsert 시도: userId=${userId}`);

    try {
      const condition = new Condition().attribute('userId').exists();
      const updatedUser = await this.userViewModel.update(
        { userId: userId },
        userView,
        {
        return: 'item',
        condition: condition
        }
      );
      return { userView: updatedUser, isNewUserView: false };
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        // 항목이 존재하지 않는 경우, 새로 생성
        const newUserView = await this.create({ 
          userId, 
          ...userView
        } as UserView);
        return { userView: newUserView, isNewUserView: true };
      }
      throw error;
    }
  }
}