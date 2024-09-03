import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsModule } from './metrics/metrics.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SellersModule } from './sellers/sellers.module';
import { configValidationSchema } from './shared/infrastructure/config/config.validation';
import { getTypeOrmConfig } from './shared/infrastructure/database/typeorm.config';
import { getMongoConfig } from './shared/infrastructure/database/mongodb.config';
import { createRedisClient, REDIS_CLIENT } from './shared/infrastructure/redis/redis.config';



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
  AuthModule,
  UsersModule,
  SellersModule
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