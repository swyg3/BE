import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOrderSellerProductsQuery } from "../impl/get -order-sellers-products.query";
import { ProductRepository } from "src/product/repositories/product.repository";
import { OrderItemsViewRepository } from "src/order-items/order-items.view.repository";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";
import { ProductView, ProductViewRepository } from "src/product/repositories/product-view.repository";
import { boolean } from "joi";


@QueryHandler(GetOrderSellerProductsQuery)
export class GetOrderSellerProductsQueryHandler implements IQueryHandler<GetOrderSellerProductsQuery> {
  constructor(
    private readonly orderItemRepository: OrderItemsViewRepository,
    private readonly productViewRepository: ProductViewRepository,
  ) { }

  async execute(query: GetOrderSellerProductsQuery):  Promise<any> {
    const { orderId } = query;

    try {
      // 1. 주문에서 productId 추출
      const productIds = await this.orderItemRepository.findProductIdsByOrderId(orderId);

      let result: ProductView[];

      if (productIds.length === 0) {
        // 주문에 상품이 없는 경우, 무작위로 7개의 상품을 가져옵니다.
        result = await this.productViewRepository.getRandomProducts(7);
      } else {
        // 2. productId들로 sellerId 찾기
        const sellerIds = await this.productViewRepository.findSellerIdsByProductIds(productIds);

        // 3. 중복 제거 및 셔플
        const uniqueSellerIds = this.shuffleArray([...new Set(sellerIds)]);

        // 4. 셔플된 sellerId들로 해당 판매자들의 상품을 찾아 7개를 채우기
        result = [];
        for (const sellerId of uniqueSellerIds) {
          if (result.length >= 7) break;

          const sellerProducts = await this.productViewRepository.findProductsBySellerId(sellerId);
          const remainingCount = 7 - result.length;
          result.push(...sellerProducts.slice(0, remainingCount));
        }
      }

      // 5. 최종 결과를 createdAt 기준으로 정렬
      const sortedResult = result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 6. ProductView[]를 반환
      return {
        success: true,
        message: `ProductView[]를 반환`,
        data: sortedResult
      };
    } catch (error) {
      console.error('Error in GetOrderSellerProductsQueryHandler:', error);
      return {
        success: false,
        message: 'ProductView[]를 반환 실패'
      };
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  }