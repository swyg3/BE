import { Module } from "@nestjs/common";
import { CqrsModule as NestCqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./event.entity";
import { EventBusService } from "./event-bus.service";

@Module({
  imports: [NestCqrsModule, TypeOrmModule.forFeature([Event])],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventSourcingModule {}
