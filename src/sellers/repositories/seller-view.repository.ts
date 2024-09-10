import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SellerView } from "../schemas/seller-view.schema";

@Injectable()
export class SellerViewRepository {
  constructor(
    @InjectModel(SellerView.name) private sellerViewModel: Model<SellerView>,
  ) {}

  async create(sellerView: Partial<SellerView>): Promise<SellerView> {
    const createdSellerView = new this.sellerViewModel(sellerView);
    return await createdSellerView.save();
  }

  async findBySellerId(sellerId: string): Promise<SellerView | null> {
    return await this.sellerViewModel.findOne({ sellerId }).exec();
  }

  async findByEmail(email: string): Promise<SellerView | null> {
    return await this.sellerViewModel.findOne({ email }).exec();
  }


  async update(
    sellerId: string,
    updates: Partial<SellerView>,
  ): Promise<SellerView | null> {
    return await this.sellerViewModel
      .findOneAndUpdate({ sellerId }, { $set: updates }, { new: true })
      .exec();
  }

  async updateBusinessNumberVerification(
    sellerId: string,
    isVerified: boolean,
  ): Promise<SellerView | null> {
    return this.sellerViewModel
      .findOneAndUpdate(
        { sellerId },
        { $set: { isBusinessNumberVerified: isVerified } },
        { new: true },
      )
      .exec();
  }
}
