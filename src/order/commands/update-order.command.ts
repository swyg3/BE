import { OrderItemDto } from "src/order-items/dtos/order-items.dto";

export class UpdateOrderCommand {
    constructor(
        public readonly orderId: string,
        public readonly totalAmount?: number,
        public readonly totalPrice?: number,
        public readonly pickupTime?: Date,
        public readonly paymentMethod?: string,
        public readonly status?: string,
        public readonly items?: OrderItemDto[]
    ) {}
}
