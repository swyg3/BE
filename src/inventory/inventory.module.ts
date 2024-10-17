import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateInventoryHandler } from "./commands/handlers/create-inventory.handler";
import { InventoryRepository } from "./repositories/inventory.repository";
import { Inventory } from "./inventory.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeleteInventoryHandler } from "./commands/handlers/delete-inventory.handler";
import { UpdateInventoryHandler } from "./commands/handlers/update-inventory.handler";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { ProductViewRepository } from "src/product/repositories/product-view.repository";
import { InventoryUpdatedEventHandler } from "./events/handlers/inventory-updated.handler";
import { DynamooseModule } from "nestjs-dynamoose";
import { ProductSchema } from "src/product/schemas/product-view.shema";
import { ConfigModule } from "@nestjs/config";

const CommandHandlers = [
  CreateInventoryHandler,
  DeleteInventoryHandler,
  UpdateInventoryHandler,
];
const EventsHandlers = [
  InventoryUpdatedEventHandler
];

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Inventory]),
    DynamooseModule.forFeature([
      { name: "ProductView", schema: ProductSchema },
    ]),
    CqrsModule,
    EventSourcingModule,
  ],
  providers: [...CommandHandlers, ...EventsHandlers, InventoryRepository, ProductViewRepository],
  exports: [InventoryRepository], 
})
export class InventoryModule {}
