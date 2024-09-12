import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { UserView } from "../schemas/user-view.schema";
import { UpdateUserProfileDto } from "../dtos/update-user-profile.dto";

@Injectable()
export class UserViewRepository {
  private readonly logger = new Logger(UserViewRepository.name);

  constructor(
    @InjectModel(UserView.name) private userViewModel: Model<UserView>,
  ) {}

  async create(userView: Partial<UserView>): Promise<UserView> {
    const createdUserView = new this.userViewModel(userView);
    return await createdUserView.save();
  }

  async findByUserId(userId: string): Promise<UserView | null> {
    return await this.userViewModel.findOne({ userId }).exec();
  }

  async findByEmail(email: string): Promise<UserView | null> {
    return await this.userViewModel.findOne({ email }).exec();
  }

  async update(userId: string, updates: UpdateUserProfileDto): Promise<void> {
    await this.userViewModel.updateOne({ userId }, { $set: updates }).exec();
  }

  async findOneAndUpdate(
    filter: { userId: string },
    update: UpdateQuery<UserView>,
    options: { upsert: boolean; new: boolean; setDefaultsOnInsert: boolean },
  ): Promise<UserView | null> {
    try {
      const result = await this.userViewModel
        .findOneAndUpdate(filter, update, {
          ...options,
          setDefaultsOnInsert: true,
        })
        .exec();
      return result;
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn(
          `userId 중복 키 에러 발생: ${filter.userId}. Attempting to update existing document.`,
        );
        return await this.userViewModel
          .findOneAndUpdate(filter, update, { new: true })
          .exec();
      }
      this.logger.error(
        `User-View findOneAndUpdate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
