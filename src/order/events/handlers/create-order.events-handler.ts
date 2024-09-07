import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CreateOrderEvent } from "../create-order.event";

@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    constructor() {}

    async handle(event: CreateOrderEvent): Promise<void> {
        const { order } = event;

        // MongoDB 컬렉션에 데이터 저장
    }
}