import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { SellerView } from "../schemas/seller-view.schema";

@Injectable()
export class SellerViewRepository {
  private readonly logger = new Logger(SellerViewRepository.name);

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

  async findOneAndUpdate(
    filter: { sellerId: string },
    update: UpdateQuery<SellerView>,
    options: { upsert: boolean; new: boolean; setDefaultsOnInsert: boolean }
  ): Promise<SellerView | null> {
    try {
      const result = await this.sellerViewModel.findOneAndUpdate(
        filter,
        update,
        { ...options, setDefaultsOnInsert: true }
      ).exec();
      return result;
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn(`sellerId 중복 키 에러 발생: ${filter.sellerId}. Attempting to update existing document.`);
        return await this.sellerViewModel.findOneAndUpdate(filter, update, { new: true }).exec();
      }
      this.logger.error(`Seller-View findOneAndUpdate: ${error.message}`, error.stack);
      throw error;
    }
  }
}
