import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { DyGetProductByIdQuery } from "../impl/dy-get-prouct-by-id.query";
import { DyProductViewRepository } from "../../repositories/dy-product-view.repository";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "../../const/path.const";
import { UserRepository } from "src/users/repositories/user.repository";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@QueryHandler(DyGetProductByIdQuery)
export class DyGetProductByIdHandler
  implements IQueryHandler<DyGetProductByIdQuery> {
  constructor(
    private readonly dyProductViewRepository: DyProductViewRepository,
    private readonly sellerViewRepository: SellerViewRepository,
  ) { }

  async execute(query: DyGetProductByIdQuery): Promise<any> {
    const product = await this.dyProductViewRepository.findByProductId(
      query.productId,
    );

    if (!product) {
      throw new NotFoundException(
        `상품 ID ${query.productId}를 찾을 수 없습니다.`,
      );
    }

    const seller = await this.sellerViewRepository.findBySellerId(
      product.sellerId,
    );

    if (!seller) {
      throw new NotFoundException(
        `판매자 ID ${product.sellerId}를 찾을 수 없습니다.`,
      );
    }
    return {

      ...product,
      storeName: seller.storeName,
      storeAddress: seller.storeAddress,
      storeNumber: seller.storePhoneNumber,
    };


  }
}
