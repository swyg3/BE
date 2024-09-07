import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { SellersController } from "./sellers.controller";
import { Seller } from "./entities/seller.entity";
import { EventStoreModule } from "src/shared/infrastructure/event-store/event-store.module";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { SellerView, SellerViewSchema } from "./schemas/seller-view.schema";
import { SellerViewRepository } from "./repositories/seller-view.repository";
import { RegisterSellerHandler } from "./commands/handlers/register-seller.handler";
import { UpdateSellerProfileHandler } from "./commands/handlers/update-seller-profile.command";
import { VerifyBusinessNumberHandler } from "src/auth/seller-auth/handlers/verify-business-number.handler";
import { SellerRegisteredHandler } from "./events/handlers/seller-registered.handler";
import { SellerProfileUpdatedHandler } from "./events/handlers/seller-profile-updated.handler";
import { VerifyBusinessNumberCommand } from "src/auth/seller-auth/commands/verify-business-number.command";
import { SellerRepository } from "./repositories/seller.repository";

const CommandHandlers = [
  RegisterSellerHandler,
  UpdateSellerProfileHandler,
  VerifyBusinessNumberHandler,
];
const QueryHandlers = [];
const EventHandlers = [
  SellerRegisteredHandler,
  SellerProfileUpdatedHandler,
  VerifyBusinessNumberCommand,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Seller]),
    MongooseModule.forFeature([
      { name: SellerView.name, schema: SellerViewSchema },
    ]),
    EventStoreModule,
    RedisModule,
  ],
  controllers: [SellersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    SellerViewRepository,
    SellerRepository,
  ],
  exports: [SellerRepository],
})
export class SellersModule {}
