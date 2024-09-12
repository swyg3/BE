import { OrderItemDto } from "src/order-itmes/dtos/order-items.dto";

export class CreateOrderCommand {
    constructor(
        public readonly userId: number,
        public readonly totalAmount: number,
        public readonly totalPrice: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: string,
        public readonly status: string,
        public readonly items: OrderItemDto[]
    ) {}
}