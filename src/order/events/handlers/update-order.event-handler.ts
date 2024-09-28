import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UpdateOrderEvent } from "../update-order.event";

@EventsHandler(UpdateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<UpdateOrderEvent> {
    async handle(event: UpdateOrderEvent) {
        console.log('주문이 수정되었습니다: ', event);
    }
}