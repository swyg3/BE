import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { GetProductByIdQuery } from "../impl/get-prouct-by-id.query";
import { ProductViewRepository } from "../../repositories/product-view.repository";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery> {
  constructor(
    private readonly ProductViewRepository: ProductViewRepository,
    private readonly sellerViewRepository: SellerViewRepository,
  ) { }

  async execute(query: GetProductByIdQuery): Promise<any> {
    const product = await this.ProductViewRepository.findByProductId(
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
      storeAddress: this.sanitizeAddress(seller.storeAddress),
      storeNumber: seller.storePhoneNumber,
    };
  }

    private sanitizeAddress(address: any): string {
      if (typeof address === 'string') {
        // 이미 문자열이면 그대로 반환
        return address;
      } else if (address && typeof address === 'object') {
        // 객체인 경우, JSON 문자열로 변환
        return JSON.stringify(address);
      } else {
        // 그 외의 경우, 빈 문자열 또는 기본값 반환
        return '';
      }
    }

  }

