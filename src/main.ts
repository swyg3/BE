import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsInterceptor } from "./metrics/metrics.interceptor";
import { MetricsService } from "./metrics/metrics.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DateTransformInterceptor } from "./shared/interceptors/dayjs.interceptor";

async function bootstrap() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault("Asia/Seoul");

  const app = await NestFactory.create(AppModule);

  // 인터셉터 설정
  app.useGlobalInterceptors(
    new MetricsInterceptor(app.get(MetricsService)),
  );
  app.useGlobalInterceptors(new DateTransformInterceptor());

  // API 버전 관리 활성화
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // 전역 접두사 설정
  app.setGlobalPrefix("api");

  // CORS 설정
  if (process.env.NODE_ENV !== "production") {
    // 개발 환경에서는 Nestjs에서 CORS를 처리
    const corsOptions = {
      origin: ["http://localhost:3000", "http://localhost:5174"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };
    app.enableCors(corsOptions);
    console.log("개발 환경: NestJS에서 CORS를 처리합니다.");
    console.log("CORS 설정:", JSON.stringify(corsOptions, null, 2));
  } else {
    // 프로덕션 환경에서는 Nginx에서 CORS를 처리
    console.log("프로덕션 환경: CORS는 Nginx에서 처리됩니다.");
  }

  // HTTP 예외 필터
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("MOONCO Swagger UI")
    .setDescription("v1.0 배포 버전 Swagger API 문서입니다.")
    .setVersion("1.0")
    .addTag("Tags")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.NODE_PORT || 3000;
  await app.listen(port);
  const baseUrl = await app.getUrl();
  console.log(`서버 실행 중...: ${baseUrl}/api`);
  console.log(`Swagger UI: ${baseUrl}/api/docs`);
}
bootstrap();
