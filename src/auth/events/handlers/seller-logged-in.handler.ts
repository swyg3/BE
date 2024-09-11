import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SellerLoggedInEvent } from "../events/seller-logged-in.event";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/sellers/entities/seller.entity";
import { Repository } from "typeorm";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(SellerLoggedInEvent)
export class SellerLoggedInEventHandler implements IEventHandler<SellerLoggedInEvent> {
  private readonly logger = new Logger(SellerLoggedInEventHandler.name);
  
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    private sellerViewRepository: SellerViewRepository
  ) {}

  async handle(event: SellerLoggedInEvent) {

    this.logger.log(`판매자 로그인 이벤트 처리: sellerId=${event.aggregateId}`);

    // PostgreSQL에서 최신 판매자 정보 조회
    const seller = await this.sellerRepository.findOne({ where: { id: event.aggregateId } });
    if (!seller) {
      throw new Error(`존재하지 않는 판매자입니다. : ${event.aggregateId}`);
    }

    // MongoDB의 seller_view 컬렉션 업데이트
    const updateResult = await this.sellerViewRepository.findOneAndUpdate(
      { sellerId: event.aggregateId },
      {
        $set: {
          email: seller.email,
          name: seller.name,
          phoneNumber: seller.phoneNumber,
          isBusinessNumberVerified: seller.isBusinessNumberVerified,
          isEmailVerified: seller.isEmailVerified,
          lastLoginAt: new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          sellerId: event.aggregateId,
          createdAt: seller.createdAt
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    this.logger.log(`판매자 뷰 업데이트 완료: sellerId=${event.aggregateId}`);
  } catch (error) {
    this.logger.error(`판매자 뷰 업데이트 중 오류 발생: ${error.message}`, error.stack);
  }
}
