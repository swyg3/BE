
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from "../shared/infrastructure/event-sourcing";

@Injectable()
export class UserActivityRepository {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getUserActivitySummary(userId: string) {
    // Implement query to get user activity summary
    const summary = await this.eventRepository.createQueryBuilder('event')
      .where('event.aggregateId = :userId', { userId })
      .andWhere('event.aggregateType = :type', { type: 'user' })
      .select('COUNT(DISTINCT CASE WHEN event.eventType = :orderType THEN event.id END)', 'orderCount')
      .addSelect('SUM(CASE WHEN event.eventType = :savingType THEN event.eventData->>.amount ELSE 0 END)', 'totalSavings')
      .setParameter('orderType', 'OrderCompleted')
      .setParameter('savingType', 'SavingsRecorded')
      .getRawOne();

    // Add logic to calculate level and title based on summary
    return {
      ...summary,
      level: this.calculateLevel(summary.orderCount),
      title: this.calculateTitle(summary.orderCount),
    };
  }

  async getUserActivityHistory(userId: string) {
    return this.eventRepository.find({
      where: { aggregateId: userId, aggregateType: 'user' },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivityByPeriod(userId: string, start: string, end: string) {
    return this.eventRepository.find({
      where: {
        aggregateId: userId,
        aggregateType: 'user',
        // createdAt: Between(new Date(start), new Date(end)),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserEcoImpact(userId: string) {
    // Implement query to calculate user's eco impact
    // This is a simplified example, you might need more complex calculations
    return this.eventRepository.createQueryBuilder('event')
      .where('event.aggregateId = :userId', { userId })
      .andWhere('event.aggregateType = :type', { type: 'user' })
      .andWhere('event.eventType = :ecoType', { ecoType: 'EcoImpactRecorded' })
      .select('SUM(event.eventData->>.co2Saved)', 'totalCO2Saved')
      .getRawOne();
  }

  private calculateLevel(orderCount: number): number {
    // Implement level calculation logic
    if (orderCount >= 50) return 5;
    if (orderCount >= 30) return 4;
    if (orderCount >= 20) return 3;
    if (orderCount >= 10) return 2;
    if (orderCount >= 5) return 1;
    return 0;
  }

  private calculateTitle(orderCount: number): string {
    // Implement title calculation logic
    if (orderCount >= 50) return '우주 친환경 활동가';
    if (orderCount >= 30) return '은하 지킴이';
    if (orderCount >= 20) return '행성 수호자';
    if (orderCount >= 10) return '지구 가디언';
    if (orderCount >= 5) return '녹색 실천가';
    return '에코 스타터';
  }
}