import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configValidationSchema } from './common/config/config.validation';
import { getMongoConfig } from './common/config/mongodb.config';
import { createRedisClient, REDIS_CLIENT } from './common/config/redis.config';
import { getTypeOrmConfig } from './common/config/typeorm.config';
import { MetricsModule } from './metrics/metrics.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
  MetricsModule,
  OrderModule,
  OrderItemsModule,
],
  controllers: [AppController],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: createRedisClient,
      inject: [ConfigService],
    },
    AppService
  ],
})
export class AppModule {}