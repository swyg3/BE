import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EventRepository } from "src/order/repositories/create-order.repository";
import { CreateOrderEvent } from "../create-order.event";

@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    constructor(
        private readonly eventRepository: EventRepository
    ) {}

    async handle(event: CreateOrderEvent) {
        const { id, userId, totalAmount, totalPrice, paymentMethod, status, items, pickupTime, createdAt } = event;
        // 주문 이벤트 받아오기
        await this.eventRepository.saveEvent(event);
    }
}