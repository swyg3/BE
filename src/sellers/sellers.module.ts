import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "./entities/seller.entity";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing/event-sourcing.module";
import * as CommandHandlers from "./commands/handlers";
import * as QueryHandlers from "./queries/handlers";
import * as EventHandlers from "./events/handlers";
import { SellerRepository } from "./repositories/seller.repository";
import { SellersController } from "./sellers.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { PasswordService } from "src/shared/services/password.service";
import { Product } from "src/product/entities/product.entity";
import { DynamooseModule } from "nestjs-dynamoose";
import { SellerSchema } from "./schemas/seller-view.schema";
import { SellerViewRepository } from "./repositories/seller-view.repository";

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    RedisModule,
    TypeOrmModule.forFeature([Seller, Product]),
    DynamooseModule.forFeature([{ name: 'SellerView', schema: SellerSchema }]),
  ],
  controllers: [SellersController],
  providers: [
    ...Object.values(CommandHandlers),
    ...Object.values(QueryHandlers),
    ...Object.values(EventHandlers),
    SellerViewRepository,
    SellerRepository,
    PasswordService,
  ],
  exports: [SellerRepository, SellerViewRepository],
})
export class SellersModule {}
