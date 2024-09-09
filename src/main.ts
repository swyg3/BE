import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomMetricsService } from './metrics/custom-metrics.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';

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
  app.setGlobalPrefix('api');

  // CORS 설정
  const corsOptions = process.env.NODE_ENV === 'production'
    ? {
        origin: ['https://your-production-frontend.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }
    : {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      };
  app.enableCors(corsOptions);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('your-tag')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.NODE_PORT || 3000;
  await app.listen(port);
  const baseUrl = await app.getUrl();
  console.log(`서버 실행 중...: ${baseUrl}/api`);
  console.log(`Swagger UI: ${baseUrl}/api/docs`);
}
bootstrap();