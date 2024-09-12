import { IEvent } from "@nestjs/cqrs";

export class CreateOrderEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly userId: number,
        public readonly totalAmount: number,
        public readonly totalPrice: number,
        public readonly paymentMethod: string,
        public readonly status: string,
        public readonly items: {
            orderId: string;
            productId: number;
            quantity: number;
            price: number;
        }[],
        public readonly pickupTime: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}
}