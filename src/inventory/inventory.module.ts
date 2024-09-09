import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateInventoryHandler } from './commands/handlers/create-inventory.handler'; // 핸들러 경로
import { InventoryRepository } from './repositories/inventory.repository';
import { EventStoreModule } from 'src/shared/event-store/event-store.module';
import { Inventory } from './inventory.entity';
import { InventoryView, InventoryViewSchema } from './schemas/inventory-view.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCreatedHandler } from './events/handlers/inventory-created.handler';
import { DeleteInventoryHandler } from './commands/handlers/delete-inventory.handler';
import { InventoryDeletedHandler } from './events/handlers/inventory-deleted.handler';
import { InventoryViewRepository } from './repositories/inventory-view.repository';

const CommandHandlers = [
    CreateInventoryHandler,    
    DeleteInventoryHandler   ]
    const EventsHandlers = [
        InventoryCreatedHandler,  
        InventoryDeletedHandler   
      ];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InventoryView.name, schema: InventoryViewSchema }]),
    TypeOrmModule.forFeature([Inventory]),
    CqrsModule,
    EventStoreModule,
  ],
  providers: [
    ...CommandHandlers,
    ...EventsHandlers, 
    InventoryRepository,
    InventoryViewRepository
  ],
})
export class InventoryModule {}
