import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsInterceptor } from "./metrics/metrics.interceptor";
import { CustomMetricsService } from "./metrics/custom-metrics.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 메트릭스 인터셉터 설정
  app.useGlobalInterceptors(
    new MetricsInterceptor(app.get(CustomMetricsService)),
  );

  // API 버전 관리 활성화
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // 전역 접두사 설정
  app.setGlobalPrefix("api");

  // CORS 설정
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://3.34.189.220']
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.enableCors(corsOptions);

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
