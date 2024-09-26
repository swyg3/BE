import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CreateOrderEvent } from "../create-order.event";

@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    async handle(event: CreateOrderEvent) {
        console.log('주문이 생성되었습니다: ', event);
    }
}