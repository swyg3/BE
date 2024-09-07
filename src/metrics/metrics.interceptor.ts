import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { CustomMetricsService } from "./custom-metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private customMetricsService: CustomMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = (Date.now() - start) / 1000;
          this.customMetricsService.incrementHttpRequests(
            method,
            path,
            response.statusCode,
          );
          this.customMetricsService.observeHttpRequestDuration(
            method,
            path,
            response.statusCode,
            duration,
          );
        },
        error: (error) => {
          const duration = (Date.now() - start) / 1000;
          this.customMetricsService.incrementHttpRequests(
            method,
            path,
            error.status || 500,
          );
          this.customMetricsService.observeHttpRequestDuration(
            method,
            path,
            error.status || 500,
            duration,
          );
        },
      }),
    );
  }
}
