import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { v4 as uuidv4 } from 'uuid';
import { UpdateOrderItemsEvent } from "../update-order-items.event";

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
@EventsHandler(UpdateOrderItemsEvent)
export class UpdateOrderItemsEventHandler implements IEventHandler<UpdateOrderItemsEvent> {
    private readonly logger = new Logger(UpdateOrderItemsEventHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, { id: string }>,
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>,
    ) {}

    async handle(event: UpdateOrderItemsEvent) {
        this.logger.log(`주문 상세 내역 수정중!!`);

        event.data.items.map(async (item) => {
            const updatedOrderItem: OrderItemsView = {
                id: uuidv4(),
                orderId: item.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            };

            // 기존 아이템이 있으면 업데이트, 없으면 새로 생성
            await this.orderItemsViewModel.update({ id: updatedOrderItem.id }, updatedOrderItem);
            this.logger.log(`DynamoDB에 주문 상세 내역 업데이트 완료: ${JSON.stringify(updatedOrderItem)}`);
        });

        console.log('주문 상세 내역이 수정되었습니다: ', event);
    }
}