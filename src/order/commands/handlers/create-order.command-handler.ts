import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-itmes/entities/order-items.entity";
import { CreateOrderAggregate } from "src/order/aggregates/create-order.aggregate";
import { Order } from "src/order/entities/order.entity";
import { Repository } from 'typeorm';
import { CreateOrderCommand } from "../create-order.command";

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly logger = new Logger(CreateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: CreateOrderCommand): Promise<any> {
        const { userId, totalAmount, totalPrice, pickupTime, items } = command;

        // 1. 주문 생성
        const newOrder = new Order();
        newOrder.userId = userId;
        newOrder.totalAmount = totalAmount;
        newOrder.totalPrice = totalPrice;
        newOrder.pickupTime = pickupTime;
        newOrder.paymentMethod = 'CASH';
        // 초기값 진행중 pending
        newOrder.status = 'PENDING';
        // 현재 시간으로 설정
        newOrder.createdAt = new Date();
        const savedOrder = await this.orderRepository.save(newOrder);

        // 2. 주문 내역 생성
        const orderItems = items.map(item => {
            const orderItem = new OrderItems();
            orderItem.orderId = savedOrder.id;
            orderItem.productId = item.productId;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            return orderItem;
        });
        await this.orderItemsRepository.save(orderItems);
        this.logger.log(`주문 내역 및 주문 상세 내역 생성 완료: ${savedOrder.id}`);

        // 3. 주문 수량 만큼 재고 삭제

        // 4. 이벤트 aggregate 생성
        const orderAggregate = new CreateOrderAggregate(savedOrder.id);

        // 5. aggregate에서 주문 등록 이벤트 생성
        const event = orderAggregate.register(
            savedOrder.id,
            userId,
            totalAmount,
            totalPrice,
            newOrder.paymentMethod,
            newOrder.status,
            items.map(item => ({
                orderId: savedOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            })),
            pickupTime,
            newOrder.createdAt,
            new Date(),
        );

        // 6. 이벤트 발행
        this.eventBus.publish(event);
    }
}