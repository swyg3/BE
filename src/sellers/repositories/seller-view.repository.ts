import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Condition } from "dynamoose/dist/Condition";

export interface SellerView {
  sellerId: string;
  email: string;
  name: string;
  phoneNumber: string;
  storeName: string;
  storeAddress: string;
  storePhoneNumber: string;
  isBusinessNumberVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

@Injectable()
export class SellerViewRepository {
  private readonly logger = new Logger(SellerViewRepository.name);

  constructor(
    @InjectModel('SellerView')
    private readonly sellerViewModel: Model<SellerView, { sellerId: string }>
  ) {}

  async create(sellerView: SellerView): Promise<SellerView> {
    try {
      this.logger.log(`SellerView 생성: ${sellerView.sellerId}`);
      return await this.sellerViewModel.create(sellerView);
    } catch (error) {
      this.logger.error(`SellerView 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySellerId(sellerId: string): Promise<SellerView | null> {
    try {
      this.logger.log(`SellerView 조회: sellerId=${sellerId}`);
      return await this.sellerViewModel.get({ sellerId });
    } catch (error) {
      this.logger.error(`SellerView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByEmail(email: string): Promise<SellerView | null> {
    try {
      this.logger.log(`SellerView 조회: email=${email}`);
      const results = await this.sellerViewModel.query('email').eq(email).exec();
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logger.error(`SellerView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async update(
    sellerId: string, 
    updates: Partial<SellerView>
  ): Promise<SellerView | null> {
    try {
      this.logger.log(`SellerView 업데이트: sellerId=${sellerId}`);
      const updatedSeller = await this.sellerViewModel.update(
        { sellerId: sellerId }, 
        updates, 
        { return: 'item' }
      );
      this.logger.log(`SellerView 업데이트 성공: ${updatedSeller}`);
      return updatedSeller;
    } catch (error) {
      this.logger.error(`SellerView 업데이트 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateBusinessNumberVerification(
    sellerId: string, 
    isVerified: boolean
  ): Promise<SellerView | null> {
    return this.update(
      sellerId, 
      { 
        isBusinessNumberVerified: isVerified 
      }
    );
  }

  async findOneAndUpdate(
    sellerId: string,
    sellerView: Partial<SellerView>
  ): Promise<{ sellerView: SellerView; isNewSellerView: boolean }> {
    this.logger.log(`SellerView Upsert 시도: sellerId=${sellerId}`);

    try {
      const condition = new Condition().attribute('sellerId').exists();
      const updatedSeller = await this.sellerViewModel.update(
        { sellerId },
        sellerView,
        {
          return: 'item',
          condition: condition
        }
      );
      return { sellerView: updatedSeller, isNewSellerView: false };
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        const newSellerView = await this.create({ 
          sellerId, 
          ...sellerView
        } as SellerView);
        return { sellerView: newSellerView, isNewSellerView: true };
      }
      this.logger.error(`SellerView Upsert 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(sellerId: string): Promise<void> {
    this.logger.log(`SellerView 삭제 시도: userId=${sellerId}`);

    try {
      await this.sellerViewModel.delete({ sellerId });
      this.logger.log(`SellerView 삭제 성공: userId=${sellerId}`);
    } catch (error) {
      this.logger.error(`SellerView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
  
}