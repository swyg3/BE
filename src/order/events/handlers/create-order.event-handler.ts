import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EventRepository } from "src/order/repositories/create-order.repository";
import { CreateOrderEvent } from "../create-order.event";

@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    private readonly logger = new Logger(CreateOrderEventHandler.name);
    
    constructor(
        private readonly eventRepository: EventRepository
    ) {}

    async handle(event: CreateOrderEvent) {
        this.logger.log('주문 event 처리중');
    }
}