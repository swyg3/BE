import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { DeleteOrderEvent } from "../delete-order.event";

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
    id: string; // 기본키
    orderId: string; // 삭제 기준
    productId: number;
    quantity: number;
    price: number;
}

@Injectable()
@EventsHandler(DeleteOrderEvent)
export class DeleteOrderEventHandler implements IEventHandler<DeleteOrderEvent> {
    private readonly logger = new Logger(DeleteOrderEventHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, { id: string }>,
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>,
    ) {}

    async handle(event: DeleteOrderEvent) {
        this.logger.log(`주문 삭제 진행중: ${event.data.id}`);

        // 1. 주문 삭제 (OrderView)
        await this.orderViewModel.delete({ id: event.data.id });
        this.logger.log(`DynamoDB에서 주문 삭제 완료: ${event.data.id}`);

        // 2. 해당 주문번호의 모든 주문 아이템 삭제 (OrderItemsView)
        const orderId = event.data.id; // 주문 번호로 사용

        // 주문 아이템 조회 후 삭제
        const deleteItemsPromises = event.data.items.map(async (item) => {
            if (item.orderId === orderId) {
                // orderId에 해당하는 아이템을 id로 찾아서 삭제
                await this.orderItemsViewModel.delete({ id: item.id });
                this.logger.log(`DynamoDB에서 주문 아이템 삭제 완료: ${item.id}`);
            }
        });

        // 모든 주문 아이템 삭제 대기
        await Promise.all(deleteItemsPromises);
        this.logger.log('모든 주문 항목이 삭제되었습니다.');

        console.log('주문이 삭제되었습니다: ', event);
    }
}