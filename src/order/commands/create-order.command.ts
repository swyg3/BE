import { PaymentMethod, Status } from "../enums/order.enum";

export class CreateOrderCommand {
    constructor(
        public readonly userId: number,
        public readonly totalAmount: number,
        public readonly totalPrice: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: PaymentMethod,
        public readonly status: Status,
        public readonly items: { orderId: number; productId: number; quantity: number; price: number } []
    ) {}
}