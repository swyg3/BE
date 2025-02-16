import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class CreateOrderEvent implements BaseEvent {
    readonly eventType = "OrderCreated";
    readonly aggregateType = "Order";
    
    constructor(
        public readonly aggregateId: string,
        public readonly data: {
            id: string,
            userId: string,
            totalAmount: number,
            totalPrice: number,
            paymentMethod: string,
            status: string,
            items: {
                orderId: string;
                productId: string;
                quantity: number;
                price: number;
            }[],
            pickupTime: string,
            createdAt: Date,
            updatedAt: Date,
            memo: boolean[],
        },
        public readonly version: number,
    ) {}
}