import { Injectable, Logger } from "@nestjs/common";
import { UserActivityRepository } from "./user-activity.repository";
import { Event as CustomEvent } from '../shared/infrastructure/event-sourcing/event.entity';
import { Product } from "src/product/entities/product.entity";

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);
  
  constructor(
    private readonly userActivityRepository: UserActivityRepository
  ) {}

  async getUserLevelAndTitle(userId: string) {
    try {
      const orders = await this.userActivityRepository.getUserOrders(userId);
      const { productIds, orderCount, orderItems } = this.processOrders(orders);
      
      const products = await this.userActivityRepository.getProductsById(Array.from(productIds));
      const productMap = new Map(products.map(p => [p.id, p]));
      
      const totalSavings = this.calculateTotalSavings(orderItems, productMap);
      const level = this.calculateLevel(orderCount);
      const title = this.calculateTitle(level);

      this.logger.log(`User ${userId} has ${orderCount} orders, level ${level}, title "${title}", total savings ${totalSavings}`);
      return { userId, orderCount, level, title, totalSavings };
    } catch (error) {
      this.logger.error(`Failed to get user level and title for user ${userId}: ${error.message}`);
      throw new Error('Failed to get user level and title');
    }
  }

  private processOrders(orders: CustomEvent[]): { productIds: Set<string>, orderCount: number, orderItems: Map<string, number> } {
    const productIds = new Set<string>();
    const orderItems = new Map<string, number>();
    let orderCount = orders.length;

    for (const order of orders) {
      const items = (order.eventData as any).items || [];
      for (const item of items) {
        if (item.productId && item.quantity) {
          productIds.add(item.productId);
          const currentQuantity = orderItems.get(item.productId) || 0;
          orderItems.set(item.productId, currentQuantity + item.quantity);
        }
      }
    }

    return { productIds, orderCount, orderItems };
  }

  private calculateTotalSavings(orderItems: Map<string, number>, productMap: Map<string, Product>): number {
    let totalSavings = 0;

    for (const [productId, quantity] of orderItems) {
      const product = productMap.get(productId);
      if (product) {
        const saving = product.originalPrice - product.discountedPrice;
        totalSavings += saving * quantity;
      }
    }

    return totalSavings;
  }

  private calculateLevel(orderCount: number): number {
    if (orderCount >= 30) return 5;
    if (orderCount >= 18) return 4;
    if (orderCount >= 10) return 3;
    if (orderCount >= 5) return 2;
    if (orderCount >= 2) return 1;
    return 0;
  }

  private calculateTitle(level: number): string {
    switch (level) {
      case 5: return '우주 친환경 활동가';
      case 4: return '은하 지킴이';
      case 3: return '행성 수호자';
      case 2: return '지구 가디언';
      case 1: return '녹색 실천가';
      default: return '에코 스타터';
    }
  }

  async getUserActivityHistory(userId: string) {
    return this.userActivityRepository.getUserActivityHistory(userId);
  }

  async getUserActivityByPeriod(userId: string, start: string, end: string) {
    return this.userActivityRepository.getUserActivityByPeriod(userId, start, end);
  }

  async getUserEcoImpact(userId: string) {
    return this.userActivityRepository.getUserEcoImpact(userId);
  }
}
