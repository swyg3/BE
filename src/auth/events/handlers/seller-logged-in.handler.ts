import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SellerLoggedInEvent } from "../events/seller-logged-in.event";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/sellers/entities/seller.entity";
import { Repository } from "typeorm";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@EventsHandler(SellerLoggedInEvent)
export class SellerLoggedInEventHandler implements IEventHandler<SellerLoggedInEvent> {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    private sellerViewRepository: SellerViewRepository
  ) {}

  async handle(event: SellerLoggedInEvent) {
    // PostgreSQL에서 최신 판매자 정보 조회
    const seller = await this.sellerRepository.findOne({ where: { id: event.aggregateId } });
  if (!seller) {
      throw new Error(`Seller not found: ${event.aggregateId}`);
    }

    // MongoDB의 seller_view 컬렉션 업데이트
    const sellerView = await this.sellerViewRepository.findBySellerId(event.aggregateId);
    if (sellerView) {
      await this.sellerViewRepository.update(event.aggregateId, {
        email: seller.email,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        isBusinessNumberVerified: seller.isBusinessNumberVerified,
        isEmailVerified: seller.isEmailVerified,
        updatedAt: new Date()
      });
    } else {
      await this.sellerViewRepository.create({
        sellerId: event.aggregateId,
        email: seller.email,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        isBusinessNumberVerified: seller.isBusinessNumberVerified,
        isEmailVerified: seller.isEmailVerified,
        createdAt: seller.createdAt,
        updatedAt: new Date()
      });
    }
  }
}