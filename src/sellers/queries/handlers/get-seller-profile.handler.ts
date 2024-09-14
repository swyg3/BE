import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";
import { GetSellerProfileQuery } from "../queries/get-seller-profile.query";

@QueryHandler(GetSellerProfileQuery)
export class GetSellerProfileHandler
  implements IQueryHandler<GetSellerProfileQuery>
{
  constructor(private readonly sellerViewRepository: SellerViewRepository) {}

  async execute(query: GetSellerProfileQuery) {
    const seller = await this.sellerViewRepository.findBySellerId(
      query.sellerId,
    );
    if (!seller) {
      throw new NotFoundException(
        `${query.sellerId} 존재하지 않는 회원입니다.`,
      );
    }
    return seller;
  }
}
