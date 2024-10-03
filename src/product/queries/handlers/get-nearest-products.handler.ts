import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNearestProductsQuery } from "../impl/get-nearest-products";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { ProductView, ProductViewRepository } from "src/product/repositories/product-view.repository";
import { DistanceCalculator } from "src/product/util/distance-calculator";
import { Polygon } from "typeorm";
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
      const userLocation = DistanceCalculator.createPolygonFromCoordinates(Number(lat), Number(lon));
      const productsWithDistance = this.calculateDistancesAndScores(allProducts, userLocation);

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
          [...productsWithDistance].sort((a, b) => b.recommendationScore - a.recommendationScore),
          7
        )
      };
    } catch (error) {
      this.logger.error(`Failed to get nearest products: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve nearest products');
    }
  }

  private calculateDistancesAndScores(products: ProductView[], userLocation: Polygon): ProductWithDistanceAndScore[] {
    return products.map(product => {
      const productLocation = DistanceCalculator.createPolygonFromCoordinates(Number(product.locationX),Number(product.locationY));
      const distance = DistanceCalculator.vincentyDistance(userLocation, productLocation);
      const recommendationScore = this.calculateRecommendationScore(distance, product.discountRate);
      
      return {
        ...product,
        distance,
        recommendationScore
      };
    });
  }

  private calculateRecommendationScore(distance: number, discountRate: number): number {
    const distanceScore = 1 / (1 + distance);
    const discountScore = discountRate / 100;
    return (distanceScore + discountScore) / 2;
  }

  private getUniqueSellerProducts(products: ProductWithDistanceAndScore[], limit: number): ProductWithDistanceAndScore[] {
    const uniqueSellerProducts: ProductWithDistanceAndScore[] = [];
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
}

// 새로운 인터페이스 정의
interface ProductWithDistanceAndScore extends ProductView {
  distance: number;
  recommendationScore: number;
}
