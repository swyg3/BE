import { Injectable } from "@nestjs/common";
import { CustomMetricsService } from "./metrics/custom-metrics.service";

@Injectable()
export class AppService {
  constructor(private customMetricsService: CustomMetricsService) {}

  getHello(): string {
    return "Hello World!";
  }

  async excuteHeavyWork(): Promise<{ result: string; duration: number }> {
    const startTime = Date.now();

    // 무거운 작업 시뮬레이션
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 5000 + 1000),
    );

    // 복잡한 계산 시뮬레이션
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.customMetricsService.observeHeavyWorkDuration(duration / 1000);

    return {
      result: `Heavy work completed. Result: ${result}`,
      duration,
    };
  }
}
