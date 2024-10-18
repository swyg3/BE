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
    // 데이터가 객체인지 확인하고 storeAddress 필드를 건너뛰도록 설정
    if (typeof data === 'object' && data !== null) {
      // storeAddress가 있을 경우 변환을 건너뜀
      if ('storeAddress' in data) {
        console.log('Skipping transformation for storeAddress:', data.storeAddress);
        // storeAddress만 건너뛰고 나머지 필드는 변환
        Object.keys(data).forEach((key) => {
          if (key !== 'storeAddress') {
            data[key] = this.transformDates(data[key]);
          }
        });
        return data; // 변환하지 않은 데이터 반환
      }

      // 나머지 필드에 대한 처리
      Object.keys(data).forEach((key) => {
        data[key] = this.transformDates(data[key]);
      });
    } else if (data instanceof Date || (typeof data === "string" && !isNaN(Date.parse(data)))) {
      return dayjs(data).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
    } else if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item));
    }

    return data;
  }
}
