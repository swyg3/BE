import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";
import {
  makeCounterProvider,
  makeHistogramProvider,
} from "@willsoto/nestjs-prometheus";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "../shared/infrastructure/event-sourcing";
import { MetricsRepository } from "./metrics.repository";
import { PrometheusService } from "./prometheus.service";

@Module({
  imports: [PrometheusModule.register({
    defaultMetrics: {
      enabled: true,
    },
  }),
  TypeOrmModule.forFeature([Event])],
  controllers: [MetricsController],
  providers: [
    PrometheusService,
    MetricsService,
    MetricsRepository,
    makeCounterProvider({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "path", "status_code"],
    }),
    makeHistogramProvider({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "path", "status_code"],
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeHistogramProvider({
      name: "heavy_work_duration",
      help: "Duration of heavy work in seconds",
      buckets: [1, 2, 5, 10, 20, 30],
    }),
  ],
  exports: [MetricsService, PrometheusService],
})
export class MetricsModule {}
