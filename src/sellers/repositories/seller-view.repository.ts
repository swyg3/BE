import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SellerView } from '../schemas/seller-view.schema';

@Injectable()
export class SellerViewRepository {
  constructor(
    @InjectModel(SellerView.name) private sellerViewModel: Model<SellerView>
  ) {}

  async findById(sellerId: string): Promise<SellerView | null> {
    return this.sellerViewModel.findOne({ sellerId }).exec();
  }

  async findByEmail(email: string): Promise<SellerView | null> {
    return this.sellerViewModel.findOne({ email }).exec();
  }

  async create(sellerData: Partial<SellerView>): Promise<SellerView> {
    const newSellerView = new this.sellerViewModel(sellerData);
    return newSellerView.save();
  }

  async update(sellerId: string, sellerData: Partial<SellerView>): Promise<SellerView | null> {
    return this.sellerViewModel.findOneAndUpdate(
      { sellerId },
      { $set: sellerData },
      { new: true }
    ).exec();
  }

  async updateBusinessNumberVerification(sellerId: string, isVerified: boolean): Promise<SellerView | null> {
    return this.sellerViewModel.findOneAndUpdate(
      { sellerId },
      { $set: { isBusinessNumberVerified: isVerified } },
      { new: true }
    ).exec();
  }
}