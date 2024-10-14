import { Injectable } from "@nestjs/common";
import { UserActivityRepository } from "./user-activity.repository";

@Injectable()
export class UserActivityService {
  constructor(
    private readonly userActivityRepository: UserActivityRepository
  ) {}

  async getUserLevelAndTitle(userId: string) {
    const orderCount = await this.userActivityRepository.getUserOrderCount(userId);
    const level = this.calculateLevel(orderCount);
    const title = this.calculateTitle(level);

    return { userId, orderCount, level, title };
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
