import { Controller, Get, Query } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";
import { CustomResponse } from "../shared/interfaces/api-response.interface";

@ApiTags("Metrics")
@Controller("metrics")
export class MetricsController extends PrometheusController {
  constructor(
    private readonly metricsService: MetricsService,
    ...args: ConstructorParameters<typeof PrometheusController>
  ) {
    super(...args);
  }

  @Get('daily-active-users')
  @ApiOperation({ summary: 'Get daily active users' })
  @ApiResponse({ status: 200, description: 'Daily active users count' })
  async getDailyActiveUsers(@Query('date') date: string): Promise<CustomResponse> {
    const data = await this.metricsService.getDailyActiveUsers(date);
    return { success: true, data };
  }

  @Get('product-views')
  @ApiOperation({ summary: 'Get product views' })
  @ApiResponse({ status: 200, description: 'Product views count' })
  async getProductViews(
    @Query('productId') productId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<CustomResponse> {
    const data = await this.metricsService.getProductViews(productId, start, end);
    return { success: true, data };
  }

  @Get('order-completion-rate')
  @ApiOperation({ summary: 'Get order completion rate' })
  @ApiResponse({ status: 200, description: 'Order completion rate' })
  async getOrderCompletionRate(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<CustomResponse> {
    const data = await this.metricsService.getOrderCompletionRate(start, end);
    return { success: true, data };
  }

  @Get('user-journey')
  @ApiOperation({ summary: 'Get user journey analysis' })
  @ApiResponse({ status: 200, description: 'User journey steps' })
  async getUserJourney(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<CustomResponse> {
    const data = await this.metricsService.getUserJourney(start, end);
    return { success: true, data };
  }

  @Get('churn-rate')
  @ApiOperation({ summary: 'Get churn rate' })
  @ApiResponse({ status: 200, description: 'Churn rate' })
  async getChurnRate(@Query('period') period: 'daily' | 'weekly' | 'monthly'): Promise<CustomResponse> {
    const data = await this.metricsService.getChurnRate(period);
    return { success: true, data };
  }
}