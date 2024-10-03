import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { CreateOrderEvent } from "../create-order.event";

// OrderView 인터페이스 정의
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

// OrderItemsView 인터페이스 정의
export interface OrderItemsView {
    id: string;
    orderId: string; // 주문 ID
    productId: number; // 제품 ID
    quantity: number; // 수량
    price: number; // 가격
}

@Injectable()
@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    private readonly logger = new Logger(CreateOrderEventHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, { id: string }>, // OrderView 모델 주입
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>, // OrderItemsView 모델 주입
    ) {}

    async handle(event: CreateOrderEvent) {
        this.logger.log(`주문 생성중!!`);

        // pickupTime을 문자열에서 Date 객체로 변환
        const pickupTime = new Date(event.data.pickupTime);

        // 새로운 주문 생성
        const newOrder: OrderView = {
            id: event.data.id,
            userId: event.data.userId,
            status: event.data.status,
            totalAmount: event.data.totalAmount,
            pickupTime: pickupTime,  // 변환된 Date 객체 할당
            paymentMethod: event.data.paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // DynamoDB에 주문 저장
        await this.orderViewModel.create(newOrder);
        this.logger.log(`DynamoDB에 주문 저장 완료: ${JSON.stringify(newOrder)}`);

        // 주문 항목 저장
        const orderItemsPromises = event.data.items.map(item => {
            const newOrderItem: OrderItemsView = {
                id: event.data.id,
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            };
            return this.orderItemsViewModel.create(newOrderItem); // DynamoDB에 주문 항목 저장
        });

        await Promise.all(orderItemsPromises);
        this.logger.log('모든 주문 항목이 저장되었습니다.');

        console.log('주문이 생성되었습니다: ', event);
    }
}
