import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { v4 as uuidv4 } from 'uuid';
import { UpdateOrderEvent } from "../update-order.event";

export interface OrderView {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    pickupTime: Date;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItemsView {
    id: string;
    orderId: string;
    productId: number;
    quantity: number;
    price: number;
}

@Injectable()
@EventsHandler(UpdateOrderEvent)
export class UpdateOrderEventHandler implements IEventHandler<UpdateOrderEvent> {
    private readonly logger = new Logger(UpdateOrderEventHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, { id: string }>,
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>,
    ) {}

    async handle(event: UpdateOrderEvent) {
        this.logger.log(`주문 수정중!!`);

        const pickupTime = new Date(event.data.pickupTime);

        const updatedOrder: OrderView = {
            id: event.data.id,
            userId: event.data.userId,
            status: event.data.status,
            totalAmount: event.data.totalAmount,
            pickupTime: pickupTime,
            paymentMethod: event.data.paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // DynamoDB에 주문 업데이트
        await this.orderViewModel.update({ id: updatedOrder.id }, updatedOrder);
        this.logger.log(`DynamoDB에 주문 업데이트 완료: ${JSON.stringify(updatedOrder)}`);

        // 주문 아이템 업데이트
        const updateItemsPromises = event.data.items.map(async (item) => {
            const updatedOrderItem: OrderItemsView = {
                id: uuidv4(),
                orderId: updatedOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            };

            // 기존 아이템이 있으면 업데이트, 없으면 새로 생성
            await this.orderItemsViewModel.update({ id: updatedOrderItem.id }, updatedOrderItem);
            this.logger.log(`DynamoDB에 주문 아이템 업데이트 완료: ${JSON.stringify(updatedOrderItem)}`);
        });

        await Promise.all(updateItemsPromises);
        this.logger.log('모든 주문 항목이 수정되었습니다.');

        console.log('주문이 수정되었습니다: ', event);
    }
}