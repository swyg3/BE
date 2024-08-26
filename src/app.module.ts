import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsModule } from './metrics/metrics.module';
import { configValidationSchema } from './common/config/config.validation';
import { getTypeOrmConfig } from './common/config/typeorm.config';
import { getMongoConfig } from './common/config/mongodb.config';
import { createRedisClient, REDIS_CLIENT } from './common/config/redis.config';



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
  MetricsModule
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