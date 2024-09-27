import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-itmes/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { CreateOrderEvent } from "src/order/events/create-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
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
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: CreateOrderCommand): Promise<any> {
        const { userId, totalAmount, totalPrice, pickupTime, items, paymentMethod, status } = command;

        // 1. 주문 생성
        const newOrder = this.orderRepository.create({
            userId,
            totalAmount,
            totalPrice,
            pickupTime,
            paymentMethod: 'CASH',
            status: 'PENDING', // 초기값 진행중 pending
            createdAt: new Date(), // 현재 시간으로 설정
        });
        const savedOrder = await this.orderRepository.save(newOrder);

        // 2. 주문 내역 생성
        const orderItems = items.map(item => {
            return this.orderItemsRepository.create({
                orderId: savedOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            });
        });
        await this.orderItemsRepository.save(orderItems);
        this.logger.log(`주문 내역 및 주문 상세 내역 생성 완료: ${savedOrder.id}`);

        // 3. 주문 수량 만큼 재고 삭제 - 이벤트도 따로 발생

        // 4. aggregate에서 주문 등록 이벤트 생성
        const event = new CreateOrderEvent(
            savedOrder.id,
            {
                id: savedOrder.id,
                userId,
                totalAmount,
                totalPrice,
                paymentMethod,
                status,
                items: items.map(item => ({
                    orderId: savedOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                pickupTime,
                createdAt: newOrder.createdAt,
                updatedAt: new Date(),
            },
            1
        );

        // 5. 이벤트 발행
        this.eventBusService.publishAndSave(event);
    }
}