import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSellerProfileQuery } from "../queries/get-seller-profile.query";
import { DySellerViewRepository } from "src/sellers/repositories/dy-seller-view.repository";

@QueryHandler(GetSellerProfileQuery)
export class GetSellerProfileHandler
  implements IQueryHandler<GetSellerProfileQuery>
{
  constructor(private readonly dySellerViewRepository: DySellerViewRepository) {}

  async execute(query: GetSellerProfileQuery) {
    const seller = await this.dySellerViewRepository.findBySellerId(
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
