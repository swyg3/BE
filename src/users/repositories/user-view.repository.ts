import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserView } from '../schemas/user-view.schema';

@Injectable()
export class UserViewRepository {
  constructor(
    @InjectModel(UserView.name) private userViewModel: Model<UserView>
  ) {}

  async create(userView: Partial<UserView>): Promise<UserView> {
    const createdUserView = new this.userViewModel(userView);
    return createdUserView.save();
  }

  async findById(id: string): Promise<UserView | null> {
    return this.userViewModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserView | null> {
    return this.userViewModel.findOne({ email }).exec();
  }
}