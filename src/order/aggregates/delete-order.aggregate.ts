import { AggregateRoot } from "@nestjs/cqrs";
import { DeleteOrderEvent } from "../events/delete-order.event";

export class DeleteOrderAggregate extends AggregateRoot {
    private version: number = 0;

    constructor(
        private readonly id: string,
    ) { super(); }

    // event3. 이벤트 형식 맞추기
    register(
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
        memo: boolean[],
    ) {
        this.version++;
        const event = new DeleteOrderEvent(
            this.id,
            {
                id,
                userId,
                totalAmount,
                totalPrice,
                paymentMethod,
                status,
                items,
                pickupTime,
                createdAt,
                updatedAt,
                memo,
            },
            this.version,
        );
        this.apply(event);
        return event;
    }
}