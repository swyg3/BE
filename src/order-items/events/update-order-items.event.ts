import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class UpdateOrderItemsEvent implements BaseEvent {
    eventType = "OrderItemsUpdated";
    aggregateType = "OrderItemsUpdate";
    
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