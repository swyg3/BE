import { Module } from '@nestjs/common';
import { CqrsModule as NestCqrsModule } from '@nestjs/cqrs';
import { EventBusService } from './event-bus.service';

@Module({
  imports: [NestCqrsModule],
  providers: [EventBusService],
  exports: [NestCqrsModule, EventBusService],
})
export class CqrsModule {}