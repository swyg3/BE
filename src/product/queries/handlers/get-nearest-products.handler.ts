import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNearestProductsQuery } from "../impl/get-nearest-products";
import { ProductView, ProductViewRepository } from "src/product/repositories/product-view.repository";
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { DistanceCalculator } from "src/product/util/distance-calculator";

interface ProductWithDistance extends ProductView {
  distance: number;
}

interface ProductGroups {
  byDistance: ProductWithDistance[];
  byDiscount: ProductWithDistance[];
  recommended: ProductWithDistance[];
}

@QueryHandler(GetNearestProductsQuery)
export class GetNearestProductsHandler implements IQueryHandler<GetNearestProductsQuery> {
  private readonly logger = new Logger(GetNearestProductsHandler.name);

  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async execute(query: GetNearestProductsQuery): Promise<ProductGroups> {
    const { lat, lon } = query;

    try {
      const allProducts = await this.productViewRepository.findAll();
      const productsWithDistance = this.calculateDistances(allProducts, lat, lon);

      return {
        byDistance: this.getUniqueSellerProducts(
          [...productsWithDistance].sort((a, b) => a.distance - b.distance),
          7
        ),
        byDiscount: this.getUniqueSellerProducts(
          [...productsWithDistance].sort((a, b) => b.discountRate - a.discountRate),
          7
        ),
        recommended: this.getUniqueSellerProducts(
          [...productsWithDistance].sort((a, b) => this.calculateRecommendationScore(b) - this.calculateRecommendationScore(a)),
          7
        )
      };
    } catch (error) {
      this.logger.error(`Failed to get nearest products: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve nearest products');
    }
  }

  private calculateDistances(products: ProductView[], lat: number, lon: number): ProductWithDistance[] {
    return products.map(product => ({
      ...product,
      distance: DistanceCalculator.vincentyDistance(
        lat,
        lon,
        Number(product.locationY),
        Number(product.locationX)
      )
    }));
  }

  private getUniqueSellerProducts(products: ProductWithDistance[], limit: number): ProductWithDistance[] {
    const uniqueSellerProducts: ProductWithDistance[] = [];
    const seenSellerIds = new Set<string>();

    for (const product of products) {
      if (!seenSellerIds.has(product.sellerId)) {
        uniqueSellerProducts.push(product);
        seenSellerIds.add(product.sellerId);

        if (uniqueSellerProducts.length === limit) {
          break;
        }
      }
    }

    return uniqueSellerProducts;
  }

  private calculateRecommendationScore(product: ProductWithDistance): number {
    // 거리와 할인율을 고려한 추천 점수 계산
    const distanceScore = 1 / (1 + product.distance); // 거리가 가까울수록 높은 점수
    const discountScore = product.discountRate / 100;
    return (distanceScore + discountScore) / 2; // 단순 평균, 필요에 따라 가중치 조정 가능
  }
}