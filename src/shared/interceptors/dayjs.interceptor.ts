import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone"; // timezone 플러그인 import

dayjs.extend(timezone); // timezone 플러그인 사용

@Injectable()
export class DateTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformDates(data)));
  }

  private transformDates(data: any): any {
    if (data instanceof Date || (typeof data === "string" && !isNaN(Date.parse(data)))) {
      return dayjs(data).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
    } else if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item));
    } else if (typeof data === 'object' && data !== null) {
      const transformedData = { ...data };
      Object.keys(transformedData).forEach((key) => {
        if (key !== 'storeAddress') {
          transformedData[key] = this.transformDates(transformedData[key]);
        }
      });
      return transformedData;
    }
    return data;
  }
}