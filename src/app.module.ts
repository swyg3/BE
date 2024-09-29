import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DynamooseModule } from "nestjs-dynamoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { InventoryModule } from "./inventory/inventory.module";
import { MetricsModule } from "./metrics/metrics.module";
import { OrderItemsModule } from "./order-items/order-items.module";
import { OrderModule } from "./order/order.module";
import { PUBLIC_FOLDER_PATH } from "./product/const/path.const";
import { ProductModule } from "./product/product.module";
import { SellersModule } from "./sellers/sellers.module";
import { configValidationSchema } from "./shared/infrastructure/config/config.validation";
import { getDynamoConfig } from "./shared/infrastructure/database/dynamodb.config";
import { getMongoConfig } from "./shared/infrastructure/database/mongodb.config";
import { getTypeOrmConfig } from "./shared/infrastructure/database/typeorm.config";
import { UsersModule } from "./users/users.module";

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
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: "/public",
    }),
    MetricsModule,
    AuthModule,
    UsersModule,
    SellersModule,
    ProductModule,
    InventoryModule,
    OrderModule,
    OrderItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
