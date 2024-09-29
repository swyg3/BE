/*import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Store } from '../schemas/store.schema';
import { ProductRepository } from 'src/product/repositories/product.repository';
import { Product } from 'src/product/entities/product.entity';
import { GetNearestStoreProducts } from '../impl/get-nearest-store.command';
import { SellerRepository } from 'src/seller/seller.repository';

@CommandHandler(GetNearestStoreProducts)
export class GetNearestStoreProductsHandler implements ICommandHandler<GetNearestStoreProducts> {
  private readonly logger = new Logger(GetNearestStoreProductsHandler.name);
    eventBus: any;

  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: GetNearestStoreProducts): Promise<any[]> {
    const { latitude, longitude } = command;

    this.logger.log(`Finding nearest store for coordinates: (${latitude}, ${longitude})`);

    const sellers = await this.sellerRepository.findAll(); // 모든 가게를 가져옵니다.

    // 거리 계산 로직을 추가하여 가장 가까운 가게를 찾습니다.
    const nearestStores = sellers.sort((a, b) => {
      return this.calculateDistance(latitude, longitude, a.latitude, a.longitude) - 
             this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
    });

    // 가장 가까운 가게의 상품들을 가져옵니다.
    const result = [];
    for (const store of nearestStores) {
      const products = this.productRepository.findByStoreId(sellers.id); // 가게 ID로 상품을 가져오는 메서드
      result.push({
        store,
        products
      });
    }

    this.eventBus.publish(new StoreNearestProductsFoundEvent(result));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine 공식을 사용한 거리 계산 예제
    const R = 6371; // 지구의 반지름 (킬로미터)
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
*/
