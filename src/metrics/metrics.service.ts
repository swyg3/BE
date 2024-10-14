import { Injectable } from "@nestjs/common";
import { MetricsRepository } from "./metrics.repository";
import { PrometheusService } from "./prometheus.service";

@Injectable()
export class MetricsService {
  constructor(private readonly metricsRepository: MetricsRepository,
    private readonly prometheusService: PrometheusService
  ) {}

  incrementHttpRequests(method: string, path: string, statusCode: number) {
    this.prometheusService.incrementHttpRequests(method, path, statusCode);
  }

  observeHttpRequestDuration(method: string, path: string, statusCode: number, duration: number) {
    this.prometheusService.observeHttpRequestDuration(method, path, statusCode, duration);
  }

  observeHeavyWorkDuration(duration: number) {
    this.prometheusService.observeHeavyWorkDuration(duration);
  }

  async getDailyActiveUsers(date: string) {
    return this.metricsRepository.getDailyActiveUsers(date);
  }

  async getProductViews(productId: string, start: string, end: string) {
    return this.metricsRepository.getProductViews(productId, start, end);
  }

  async getOrderCompletionRate(start: string, end: string) {
    return this.metricsRepository.getOrderCompletionRate(start, end);
  }

  async getUserJourney(start: string, end: string) {
    return this.metricsRepository.getUserJourney(start, end);
  }

  async getChurnRate(period: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    const startDate = this.getStartDate(now, period);
    const previousStartDate = this.getStartDate(startDate, period);

    const currentUsers = await this.metricsRepository.getActiveUsersCount(startDate, now);
    const previousUsers = await this.metricsRepository.getActiveUsersCount(previousStartDate, startDate);

    const churnedUsers = Math.max(previousUsers - currentUsers, 0);
    const churnRate = previousUsers > 0 ? (churnedUsers / previousUsers) * 100 : 0;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      churnRate: Number(churnRate.toFixed(2)),
      churnedUsers,
      previousUsers
    };
  }

  private getStartDate(date: Date, period: 'daily' | 'weekly' | 'monthly'): Date {
    const result = new Date(date);
    switch (period) {
      case 'daily':
        result.setDate(result.getDate() - 1);
        break;
      case 'weekly':
        result.setDate(result.getDate() - 7);
        break;
      case 'monthly':
        result.setMonth(result.getMonth() - 1);
        break;
    }
    return result;
  }
}