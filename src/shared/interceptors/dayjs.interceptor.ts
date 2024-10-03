import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import dayjs from "dayjs";

@Injectable()
export class DateTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformDates(data)));
  }

  private transformDates(data: any): any {
    if (
      data instanceof Date ||
      (typeof data === "string" && !isNaN(Date.parse(data)))
    ) {
      return dayjs(data).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"); // 포맷 조정 가능
    } else if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item));
    } else if (typeof data === "object" && data !== null) {
      Object.keys(data).forEach((key) => {
        data[key] = this.transformDates(data[key]);
      });
    }
    return data;
  }
}
