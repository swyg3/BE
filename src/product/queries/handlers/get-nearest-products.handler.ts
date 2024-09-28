import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNearestProductsQuery } from "../impl/get-nearest-products";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";

@QueryHandler(GetNearestProductsQuery)
export class GetNearestProductsHandler implements IQueryHandler<GetNearestProductsQuery> {
  constructor(private readonly productViewRepository: ProductViewRepository) {}

  async execute(query: GetNearestProductsQuery): Promise<any[]> {
    const { lat, lon, limit } = query;

    // 모든 제품을 가져옵니다.
    const allProducts = await this.productViewRepository.findAll();

    // 3. 거리 계산 및 정렬 로직
    const productsWithDistance = allProducts.map(product => ({
      ...product,
      distance: this.calculateApproximateWalkingDistance(
        lat,
        lon,
        Number(product.locationY),
        Number(product.locationX)
      )
    })).sort((a, b) => a.distance - b.distance);

    // 4. 결과 필터링 (판매자 ID 중복 제거)
    const uniqueSellerProducts = [];
    const seenSellerIds = new Set();

    for (const product of productsWithDistance) {
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