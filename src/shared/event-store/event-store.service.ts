import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./event.entity";

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async saveEvent(event: Partial<Event>): Promise<Event> {
    return this.eventRepository.save(event);
  }

  async getEventsForAggregate(aggregateId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { aggregateId },
      order: { version: "ASC" },
    });
  }
}
