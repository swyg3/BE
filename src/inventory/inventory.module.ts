import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateInventoryHandler } from "./commands/handlers/create-inventory.handler";
import { InventoryRepository } from "./repositories/inventory.repository";
import { Inventory } from "./inventory.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeleteInventoryHandler } from "./commands/handlers/delete-inventory.handler";
import { UpdateInventoryHandler } from "./commands/handlers/update-inventory.handler";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";

const CommandHandlers = [
  CreateInventoryHandler,
  DeleteInventoryHandler,
  UpdateInventoryHandler,
];
const EventsHandlers = [];

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    CqrsModule,
    EventSourcingModule,
  ],
  providers: [...CommandHandlers, ...EventsHandlers, InventoryRepository],
  exports: [InventoryRepository], 
})
export class InventoryModule {}
