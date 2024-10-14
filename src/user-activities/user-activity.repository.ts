
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Event } from "../shared/infrastructure/event-sourcing";

@Injectable()
export class UserActivityRepository {
  private readonly logger = new Logger(UserActivityRepository.name);
  
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getUserOrderCount(userId: string): Promise<number> {
    const queryBuilder = this.eventRepository.createQueryBuilder('event')
    .where('"eventType" = :eventType', { eventType: 'OrderCreated' })
    .andWhere('"aggregateType" = :aggregateType', { aggregateType: 'Order' })
    .andWhere('"eventData"::jsonb->>\'userId\' = :userId', { userId });

    try {
      const count = await queryBuilder.getCount();
      this.logger.log(`Order count for user ${userId}: ${count}`);
      return count;
    } catch (error) {
      this.logger.error(`Error getting order count for user ${userId}: ${error.message}`);
      throw error;
    }
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
}