import { Injectable, Logger } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Histogram } from "prom-client";

@Injectable()
export class CustomMetricsService {
  private readonly logger = new Logger(CustomMetricsService.name);

  constructor(
    @InjectMetric("http_requests_total")
    private httpRequestsCounter: Counter<string>,
    @InjectMetric("http_request_duration_seconds")
    private httpRequestDurationHistogram: Histogram<string>,
    @InjectMetric("heavy_work_duration")
    private heavyWorkDurationHistogram: Histogram<string>,
  ) {}

  incrementHttpRequests(method: string, path: string, statusCode: number) {
    this.httpRequestsCounter.inc({
      method,
      path,
      status_code: statusCode.toString(),
    });
    this.logger.debug(
      `Incremented http_requests_total: ${method} ${path} ${statusCode}`,
    );
  }

  observeHttpRequestDuration(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDurationHistogram.observe(
      { method, path, status_code: statusCode.toString() },
      duration,
    );
    this.logger.debug(
      `Observed http_request_duration_seconds: ${method} ${path} ${statusCode} ${duration}`,
    );
  }

  observeHeavyWorkDuration(duration: number) {
    this.heavyWorkDurationHistogram.observe(duration);
    this.logger.debug(`Observed heavy_work_duration: ${duration}`);
  }
}
