import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateInventoryHandler } from './commands/handlers/create-inventory.handler';
import { InventoryRepository } from './repositories/inventory.repository';
import { EventStoreModule } from 'src/shared/event-store/event-store.module';
import { Inventory } from './inventory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteInventoryHandler } from './commands/handlers/delete-inventory.handler';
import { UpdateInventoryHandler } from './commands/handlers/update-inventory.handler';

const CommandHandlers = [CreateInventoryHandler, DeleteInventoryHandler, UpdateInventoryHandler]
const EventsHandlers = [];

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    CqrsModule,
    EventStoreModule,
  ],
  providers: [
    ...CommandHandlers,
    ...EventsHandlers,
    InventoryRepository,
  ],
})
export class InventoryModule { }
