import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { CustomMetricsService } from './metrics/custom-metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new MetricsInterceptor(app.get(CustomMetricsService)),
  );
  await app.listen(3000);
}
bootstrap();
