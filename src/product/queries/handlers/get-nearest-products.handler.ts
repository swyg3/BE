import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNearestProductsQuery } from "../impl/get-nearest-products";
import { ProductView, ProductViewRepository } from "src/product/repositories/product-view.repository";

interface ProductWithDistance extends ProductView {
  distance: number;
}

@QueryHandler(GetNearestProductsQuery)
export class GetNearestProductsHandler implements IQueryHandler<GetNearestProductsQuery> {
  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async execute(query: GetNearestProductsQuery): Promise<{
    byDistance: ProductWithDistance[];
    byDiscount: ProductWithDistance[];
    recommended: ProductWithDistance[];
  }> {
    const { lat, lon } = query;

    const allProducts = await this.productViewRepository.findAll();

    const productsWithDistance = allProducts.map(product => ({
      ...product,
      distance: this.calculateApproximateWalkingDistance(
        lat,
        lon,
        Number(product.locationY),
        Number(product.locationX)
      )
    }));

    const byDistance = this.getUniqueSellerProducts(
      [...productsWithDistance].sort((a, b) => a.distance - b.distance),
      7
    );

    const byDiscount = this.getUniqueSellerProducts(
      [...productsWithDistance].sort((a, b) => b.discountRate - a.discountRate),
      7
    );

    const recommended = this.getUniqueSellerProducts(
      [...productsWithDistance].sort((a, b) => {
        const scoreA = this.calculateRecommendationScore(a);
        const scoreB = this.calculateRecommendationScore(b);
        return scoreB - scoreA;
      }),
      7
    );

    return { byDistance, byDiscount, recommended };
  }

  private getUniqueSellerProducts(products: ProductWithDistance[], limit: number): ProductWithDistance[] {
    const uniqueSellerProducts = [];
    const seenSellerIds = new Set();

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
    const distanceScore = 1 / (product.distance + 1);  // 거리가 가까울수록 높은 점수
    const discountScore = product.discountRate / 100;  // 할인율이 높을수록 높은 점수
    return (distanceScore + discountScore) / 2;  // 거리와 할인율의 평균 점수
  }

  calculateApproximateWalkingDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 지구의 반경 (km)

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const directDistance = R * c;

    // Manhattan distance approximation
    const latDistance = Math.abs(lat2 - lat1) * 111.32; // 1도의 위도 거리는 약 111.32km
    const lonDistance = Math.abs(lon2 - lon1) * 111.32 * Math.cos(this.toRadians((lat1 + lat2) / 2));

    const manhattanDistance = latDistance + lonDistance;

    // 직선거리와 Manhattan distance의 평균을 사용
    const approximateWalkingDistance = (directDistance + manhattanDistance) / 2;

    return approximateWalkingDistance * 1000; // 미터 단위로 변환
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}