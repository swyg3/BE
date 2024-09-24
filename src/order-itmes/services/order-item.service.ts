import { CreateOrderEvent } from "src/order/events/create-order.event";
import { EventRepository } from "src/order/repositories/create-order.repository";

export class OrderItemService {
    constructor(
        private readonly eventRepository: EventRepository,
    ) {}

    // 주문 ID로 주문 상세 조회
    async getOrderItemsByOrderId(orderId: string): Promise<CreateOrderEvent[]> {
        return ;
    }
}