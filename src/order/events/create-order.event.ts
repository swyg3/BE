import { PaymentMethod, Status } from "../enums/order.enum";

export class CreateOrderEvent {
    constructor(
        public readonly userId: number,
        public readonly sellerId: number,
        public readonly totalAmount: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: PaymentMethod,
        public readonly status: Status,
        public readonly items: any,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}
}