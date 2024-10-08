import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class DeleteOrderEvent implements BaseEvent {
    readonly eventType = "OrderDeleted";
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
                id: string;
                orderId: string;
                productId: string;
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