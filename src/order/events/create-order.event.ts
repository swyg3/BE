import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class CreateOrderEvent implements BaseEvent {
    readonly eventType = "OrderCreated";
    readonly aggregateType = "Order";
    
    constructor(
        public readonly aggregateId: string,
        public readonly data: {
            id: string,
            userId: number,
            totalAmount: number,
            totalPrice: number,
            paymentMethod: string,
            status: string,
            items: {
                orderId: string;
                productId: number;
                quantity: number;
                price: number;
            }[],
            pickupTime: Date,
            createdAt: Date,
            updatedAt: Date,
        },
        public readonly version: number,
    ) {}
}