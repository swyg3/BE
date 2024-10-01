import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { CreateOrderEvent } from "src/order/events/create-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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
        const id = uuidv4();

        try {
            // 1. 주문 생성
            const newOrder = this.orderRepository.create({
                id,
                userId,
                totalAmount,
                totalPrice,
                pickupTime,
                paymentMethod: 'CASH',
                status: 'PENDING', // 초기값 진행중 pending
                createdAt: new Date(),
            });
            const savedOrder = await this.orderRepository.save(newOrder);
            this.logger.log(`Saved Order: ${JSON.stringify(savedOrder)}`);

            // 2. 주문 내역 생성
            const orderItems = items.map(item => {
                return this.orderItemsRepository.create({
                    orderId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                });
            });

            const savedItems = await this.orderItemsRepository.save(orderItems);
            this.logger.log(`Saved Order Items: ${JSON.stringify(savedItems)}`);

            // 3. aggregate에서 주문 등록 이벤트 생성
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

            // 4. 이벤트 발행
            await this.eventBusService.publishAndSave(event);
            this.logger.log(`Order event published: ${JSON.stringify(event)}`);
        } catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`);
            throw error;
        }
    }
}
