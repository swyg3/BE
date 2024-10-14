import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderEvent } from "../create-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

export interface OrderView {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    pickupTime: Date;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
    totalPrice: number;
    memo: string[];
}

export interface OrderItemsView {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
}

@Injectable()
@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    private readonly logger = new Logger(CreateOrderEventHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, { id: string }>,
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>,
        private readonly eventBusService: EventBusService
    ) {}

    async handle(event: CreateOrderEvent) {
        this.logger.log(`주문 생성중!!`);

        // PostgreSQL에 이벤트 저장
        // await this.eventBusService.publishAndSave(event);

        const pickupTime = new Date(event.data.pickupTime);

        const newOrder: OrderView = {
            id: event.data.id,
            userId: event.data.userId,
            status: event.data.status,
            totalAmount: event.data.totalAmount,
            totalPrice: event.data.totalPrice,
            pickupTime: pickupTime,
            paymentMethod: event.data.paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
            memo: event.data.memo,
        };

        // DynamoDB에 주문 저장
        await this.orderViewModel.create(newOrder);
        this.logger.log(`DynamoDB에 주문 저장 완료: ${JSON.stringify(newOrder)}`);

        const orderItemsPromises = event.data.items.map(async (item) => {
            const uuId = uuidv4();
            const newOrderItem: OrderItemsView = {
                id: uuId,
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            };
            this.logger.log(`DynamoDB에 주문 아이템 저장 완료: ${JSON.stringify(newOrderItem)}`);
            return this.orderItemsViewModel.create(newOrderItem);
        });

        await Promise.all(orderItemsPromises);
        this.logger.log('모든 주문 항목이 저장되었습니다.');

        console.log('주문이 생성되었습니다: ', event);
    }
}