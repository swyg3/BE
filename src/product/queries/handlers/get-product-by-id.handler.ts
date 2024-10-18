import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { GetProductByIdQuery } from "../impl/get-prouct-by-id.query";
import { ProductViewRepository } from "../../repositories/product-view.repository";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";
import { GetProductByIdResponseDto } from "src/product/dtos/get-product-id.dto";

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery> {
  constructor(
    private readonly ProductViewRepository: ProductViewRepository,
    private readonly sellerViewRepository: SellerViewRepository,
  ) { }

  async execute(query: GetProductByIdQuery): Promise<GetProductByIdResponseDto> {
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
     // 여기서 storeAddress 확인
     console.log('Seller Address before sanitization:', seller.storeAddress);
    
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
      // 객체인 경우, 주소 필드를 적절히 조합하여 문자열로 반환
      // 예시: address 객체의 구조에 따라 적절히 수정하세요
      return `${address.street}, ${address.city}, ${address.country}`;
    } else {
      // 그 외의 경우, 빈 문자열 또는 기본값 반환
      return '';
    }
  }

  }

