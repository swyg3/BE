
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Event } from "../shared/infrastructure/event-sourcing";

@Injectable()
export class UserActivityRepository {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getUserOrderCount(userId: string): Promise<number> {
    return this.eventRepository.count({
      where: {
        eventType: 'OrderCreated',
        aggregateType: 'Order',
        eventData: Raw(alias => `${alias}->>'userId' = :userId`, { userId })
      },
    });
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