import { CreateOrderEvent } from "src/order/events/create-order.event";
import { EventRepository } from "src/order/repositories/create-order.repository";
import { UpdateOrderItemDto } from "../dtos/update-order-itmes.dto";

export class OrderItemService {
    updateOrderItem(updateOrderItemDto: UpdateOrderItemDto) {
        throw new Error('Method not implemented.');
    }
    constructor(
        private readonly eventRepository: EventRepository,
    ) {}

    // 주문 ID로 주문 상세 조회
    async getOrderItemsByOrderId(orderId: string): Promise<CreateOrderEvent[]> {
        return ;
    }
}