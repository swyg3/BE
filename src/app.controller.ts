import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Prometheus 테스트')  // 컨트롤러에 대한 태그 추가
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello World! GET 요청 테스트' })  // 엔드포인트 설명
  @ApiResponse({ status: 200, description: 'Hello World!가 반환됩니다.', type: String })  // 응답 설명
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('heavy-work')
  @ApiOperation({ summary: '무거운 작업 테스트' })
  @ApiResponse({ status: 200, description: '실행 결과를 반환합니다.', type: String })
  async executeHeavyWork() {
    return this.appService.executeHeavyWork();
  }
}