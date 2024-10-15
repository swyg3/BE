import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserActivityService } from "./user-activity.service";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User-Activities')
@Controller('user-activities')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get('level-title/:userId')
  @ApiOperation({ summary: '사용자 레벨 및 타이틀 조회' })
  @ApiParam({ name: 'userId', type: 'string', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '사용자 레벨 및 타이틀 정보', 
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '요청 성공 여부' },
        data: { 
          type: 'object',
          properties: {
            userId: { type: 'string', description: '사용자 ID' },
            name: { type: 'string', description: '사용자 이름' },
            email: { type: 'string', description: '사용자 이메일' },
            phoneNumber: { type: 'string', description: '사용자 전화번호' },
            registeredAt: { type: 'string', format: 'date-time', description: '회원가입 날짜' },
            orderCount: { type: 'number', description: '주문 횟수' },
            level: { type: 'number', description: '사용자 레벨' },
            title: { type: 'string', description: '사용자 타이틀' },
            totalSavings: { type: 'number', description: '총 절약 금액' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getUserLevelAndTitle(@Param('userId') userId: string) {
      const result = await this.userActivityService.getUserLevelAndTitle(userId);
      return { success: true, data: result };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: '사용자 활동 내역 조회' })
  @ApiParam({ name: 'userId', type: 'string', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 활동 내역' })
  async getUserActivityHistory(@Param('userId') userId: string) {
    return this.userActivityService.getUserActivityHistory(userId);
  }

  @Get('period/:userId')
  @ApiOperation({ summary: '특정 기간 사용자 활동 조회' })
  @ApiParam({ name: 'userId', type: 'string', description: '사용자 ID' })
  @ApiQuery({ name: 'start', type: 'string', description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', type: 'string', description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '지정된 기간의 사용자 활동 내역' })
  async getUserActivityByPeriod(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.userActivityService.getUserActivityByPeriod(userId, start, end);
  }

  @Get('eco-impact/:userId')
  @ApiOperation({ summary: '사용자 환경 영향 조회' })
  @ApiParam({ name: 'userId', type: 'string', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자의 환경 영향 정보' })
  async getUserEcoImpact(@Param('userId') userId: string) {
    return this.userActivityService.getUserEcoImpact(userId);
  }
}