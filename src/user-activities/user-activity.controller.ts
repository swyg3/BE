import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserActivityService } from "./user-activity.service";

@Controller('user-activities')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get(':userId/summary')
  async getUserActivitySummary(@Param('userId') userId: string) {
    return this.userActivityService.getUserActivitySummary(userId);
  }

  @Get(':userId/history')
  async getUserActivityHistory(@Param('userId') userId: string) {
    return this.userActivityService.getUserActivityHistory(userId);
  }

  @Get(':userId/period')
  async getUserActivityByPeriod(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.userActivityService.getUserActivityByPeriod(userId, start, end);
  }

  @Get(':userId/eco-impact')
  async getUserEcoImpact(@Param('userId') userId: string) {
    return this.userActivityService.getUserEcoImpact(userId);
  }
}