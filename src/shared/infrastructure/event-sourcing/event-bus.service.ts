import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./event.entity";
import { BaseEvent } from "./interfaces/base-event.interface";

@Injectable()
export class EventBusService {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async publishAndSave(event: BaseEvent): Promise<void> {
    // 이벤트 발행
    this.eventBus.publish(event);
    //
    // 이벤트 저장
    const storedEvent = this.eventRepository.create({
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventType: event.eventType,
      eventData: event.data,
      version: event.version,
    });
    await this.eventRepository.save(storedEvent);
  }

  async getEvents(aggregateId: string): Promise<Event[]> {
    return this.eventRepository.find({ where: { aggregateId } });
  }

  async publishOrder(event: BaseEvent): Promise<void> {
    // event4. 이벤트 발행
    this.eventBus.publish(event);

    // event5. 이벤트 저장
    const storedEvent = this.eventRepository.create({
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      eventType: event.eventType,
      eventData: event.data,
      version: event.version,
    });
    await this.eventRepository.save(storedEvent);
  }
}
