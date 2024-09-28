import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "../entities/seller.entity";

@Injectable()
export class SellerRepository {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  async findBySellerId(sellerId: string): Promise<Seller | undefined> {
    return this.sellerRepository.findOne({ where: { id: sellerId } });
  }

  async findByEmail(email: string): Promise<Seller | undefined> {
    return this.sellerRepository.findOne({ where: { email } });
  }

  create(sellerData: Partial<Seller>): Seller {
    return this.sellerRepository.create(sellerData);
  }

  async save(seller: Seller): Promise<Seller> {
    return this.sellerRepository.save(seller);
  }

  async upsert(
    email: string,
    sellerData: Partial<Seller>,
  ): Promise<{ seller: Seller; isNewSeller: boolean }> {
    const existingSeller = await this.sellerRepository.findOne({
      where: { email },
    });

    if (existingSeller) {
      await this.sellerRepository.update({ email }, sellerData);
      const updatedSeller = await this.findByEmail(email);
      return { seller: updatedSeller, isNewSeller: false };
    } else {
      const newSeller = this.sellerRepository.create({ email, ...sellerData });
      const savedSeller = await this.sellerRepository.save(newSeller);
      return { seller: savedSeller, isNewSeller: true };
    }
  }

  async updateBusinessNumberVerification(
    sellerId: string,
    isVerified: boolean,
  ): Promise<Seller> {
    const seller = await this.findBySellerId(sellerId);
    if (!seller) {
      throw new Error("존재하지 않는 판매자입니다.");
    }

    seller.isBusinessNumberVerified = isVerified;
    return this.sellerRepository.save(seller);
  }

  async getSellerAddress(sellerId: string): Promise<string | null> {
    try {
      const seller = await this.sellerRepository.findOne({ 
        where: { id: sellerId },
        select: ['storeAddress'] 
      });
      
      if (seller) {
        return seller.storeAddress || null;
      }
      return null;
    } catch (error) {
      throw new Error("판매자 주소가 존재하지 않습니다.");
    }
  }
}
