import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./repositories/product.repository";
import { CreateProductHandler } from "./commands/handlers/create-product.handler";
import { ProductView, ProductViewSchema } from "./schemas/product-view.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { CommandHandler, CqrsModule, EventsHandler } from "@nestjs/cqrs";
import { ProductViewRepository } from "./repositories/product-view.repository";
import { GetProductByIdHandler } from "./queries/handlers/get-product-by-id.handler";
import { DeleteProductHandler } from "./commands/handlers/delete-product.handler";
import { UpdateProductHandler } from "./commands/handlers/update-product.handler";
import { ProductUpdatedEventHandler } from "./events/handlers/product-update.handler";
import { ProductDeletedHandler } from "./events/handlers/product-deleted.handler";
import { InventoryCreatedEvent } from "src/inventory/events/impl/inventory-created.event";
import { ProductCreatedHandler } from "./events/handlers/product-created.handler";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { GetProductByDiscountRateHandler } from "./queries/handlers/get-products-by-discountRate.handler";

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];
const EventsHandlers = [
  InventoryCreatedEvent,
  ProductCreatedHandler,
  ProductUpdatedEventHandler,
  ProductDeletedHandler,
];

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: ProductView.name, schema: ProductViewSchema },
    ]),
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [
    ...CommandHandlers,
    ...EventsHandlers,
    ProductRepository,
    ProductViewRepository,
    GetProductByIdHandler,
    GetProductByDiscountRateHandler
  ],
  controllers: [ProductController],
  exports: [ProductRepository],
})
export class ProductModule {}
