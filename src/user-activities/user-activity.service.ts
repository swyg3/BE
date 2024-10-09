import { Injectable } from "@nestjs/common";
import { UserActivityRepository } from "./user-activity.repository";

@Injectable()
export class UserActivityService {
  constructor(
    private readonly userActivityRepository: UserActivityRepository
  ) {}

  async getUserActivitySummary(userId: string) {
    return this.userActivityRepository.getUserActivitySummary(userId);
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
