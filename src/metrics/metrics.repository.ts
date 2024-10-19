import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from "../shared/infrastructure/event-sourcing";

@Injectable()
export class MetricsRepository {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) { }

  async getDailyActiveUsers(date: string) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const result = await this.eventRepository.createQueryBuilder('event')
      .where('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('event.aggregateType = :type', { type: 'user' })
      .select('COUNT(DISTINCT event.aggregateId)', 'activeUsers')
      .getRawOne();

    return {
      date,
      activeUsers: Number(result.activeUsers)
    };
  }

  async getProductViews(productId: string, start: string, end: string) {
    const views = await this.eventRepository.count({
      where: {
        aggregateId: productId,
        aggregateType: 'product',
        eventType: 'ProductViewed',
        createdAt: Between(new Date(start), new Date(end)),
      },
    });
    // 조회수에서 7을 뺍니다. 단, 음수가 되지 않도록 합니다.
    const adjustedViews = Math.max(views - 6, 0);
    return {
      productId,
      adjustedViews,
      startDate: start,
      endDate: end
    };
  }

  async getOrderCompletionRate(start: string, end: string) {
    const result = await this.eventRepository.createQueryBuilder('event')
      .where('event.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('event.aggregateType = :type', { type: 'order' })
      .select('COUNT(CASE WHEN event.eventType = :startedType THEN 1 END)', 'started')
      .addSelect('COUNT(CASE WHEN event.eventType = :completedType THEN 1 END)', 'completed')
      .setParameter('startedType', 'OrderStarted')
      .setParameter('completedType', 'OrderCompleted')
      .getRawOne();

    const started = Number(result.started);
    const completed = Number(result.completed);
    const rate = started > 0 ? (completed / started) * 100 : 0;

    return {
      startDate: start,
      endDate: end,
      started,
      completed,
      rate: Number(rate.toFixed(2))
    };
  }

  async getUserJourney(start: string, end: string) {
    const steps = await this.eventRepository.createQueryBuilder('event')
      .where('event.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('event.aggregateType = :type', { type: 'user' })
      .select('event.eventType', 'step')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.eventType')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      startDate: start,
      endDate: end,
      steps: steps.map(step => ({
        step: step.step,
        count: Number(step.count)
      }))
    };
  }

  async getActiveUsersCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.eventRepository.createQueryBuilder('event')
      .where('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('event.aggregateType = :type', { type: 'user' })
      .select('COUNT(DISTINCT event.aggregateId)', 'activeUsers')
      .getRawOne();

    return Number(result.activeUsers);
  }
}