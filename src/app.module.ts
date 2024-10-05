import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DynamooseModule } from "nestjs-dynamoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MetricsModule } from "./metrics/metrics.module";
import { OrderItemsModule } from "./order-items/order-items.module";
import { OrderModule } from "./order/order.module";
import { configValidationSchema } from "./shared/infrastructure/config/config.validation";
import { getDynamoConfig } from "./shared/infrastructure/database/dynamodb.config";
import { getMongoConfig } from "./shared/infrastructure/database/mongodb.config";
import { getTypeOrmConfig } from "./shared/infrastructure/database/typeorm.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>("THROTTLE_TTL"),
          limit: config.get<number>("THROTTLE_LIMIT"),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await getMongoConfig(configService),
      inject: [ConfigService],
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDynamoConfig(configService),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      serveRoot: "/public",
    }),
    MetricsModule,
    OrderModule,
    OrderItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
