import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventStoreService } from './event-store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}