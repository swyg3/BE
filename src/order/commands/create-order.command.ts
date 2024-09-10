import { OrderItemsDto } from "src/order-items/dtos/order-items.dto";

export class CreateOrderCommand {
    constructor(
        public readonly userId: number,
        public readonly totalAmount: number,
        public readonly totalPrice: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: string,
        public readonly status: string,
        public readonly items: OrderItemsDto[],
    ) {}
}