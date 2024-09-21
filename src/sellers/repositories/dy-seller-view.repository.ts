import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Condition } from "dynamoose/dist/Condition";

export interface DySellerView {
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
export class DySellerViewRepository {
  private readonly logger = new Logger(DySellerViewRepository.name);

  constructor(
    @InjectModel('SellerView')
    private readonly sellerViewModel: Model<DySellerView, { sellerId: string }>
  ) {}

  async create(sellerView: DySellerView): Promise<DySellerView> {
    try {
      this.logger.log(`SellerView 생성: ${sellerView.sellerId}`);
      return await this.sellerViewModel.create(sellerView);
    } catch (error) {
      this.logger.error(`SellerView 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySellerId(sellerId: string): Promise<DySellerView | null> {
    try {
      this.logger.log(`SellerView 조회: sellerId=${sellerId}`);
      return await this.sellerViewModel.get({ sellerId });
    } catch (error) {
      this.logger.error(`SellerView 조회 실패: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByEmail(email: string): Promise<DySellerView | null> {
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
    updates: Partial<DySellerView>
  ): Promise<DySellerView | null> {
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
  ): Promise<DySellerView | null> {
    return this.update(
      sellerId, 
      { 
        isBusinessNumberVerified: isVerified 
      }
    );
  }

  async findOneAndUpdate(
    sellerId: string,
    sellerView: Partial<DySellerView>
  ): Promise<{ sellerView: DySellerView; isNewSellerView: boolean }> {
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
        } as DySellerView);
        return { sellerView: newSellerView, isNewSellerView: true };
      }
      this.logger.error(`SellerView Upsert 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
}