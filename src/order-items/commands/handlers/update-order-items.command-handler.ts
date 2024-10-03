import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { UpdateOrderItemsEvent } from "src/order-items/events/update-order-items.event";
import { Order } from "src/order/entities/order.entity";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from 'typeorm';
import { UpdateOrderItemsCommand } from "../update-order-items.command";

@Injectable()
@CommandHandler(UpdateOrderItemsCommand)
export class UpdateOrderCommandHandler implements ICommandHandler<UpdateOrderItemsCommand> {
    private readonly logger = new Logger(UpdateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: UpdateOrderItemsCommand): Promise<any> {
        const { id, userId, totalAmount, totalPrice, pickupTime, items, paymentMethod, status, createdAt } = command;

        try {
            // 1. 주문 찾기
            const order = await this.orderRepository.findOne({ where: { id } });
            if (!order) {
                throw new Error(`Order with ID ${id} not found.`);
            }

            // 2. 주문 아이템 수정
            if (items && items.length > 0) {
                const updatedItems = items.map(item => {
                    return this.orderItemsRepository.update(
                        { orderId: id, productId: item.productId },
                        { quantity: item.quantity, price: item.price }
                    );
                });
                await Promise.all(updatedItems);
                this.logger.log(`Updated Order Items for Order ID: ${id}`);
            }

            // 3. aggregate에서 주문 수정 이벤트 생성
            const event = new UpdateOrderItemsEvent(
                id,
                {
                    id,
                    userId,
                    totalAmount: totalAmount,
                    totalPrice: totalPrice,
                    paymentMethod: paymentMethod,
                    status: status,
                    items: items.map(item => ({
                        orderId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    pickupTime: pickupTime,
                    createdAt: createdAt,
                    updatedAt: new Date(),
                },
                1
            );

            // 4. 이벤트 발행
            await this.eventBusService.publishAndSave(event);
            this.logger.log(`Order Items Update Event Published: ${JSON.stringify(event)}`);
        } catch (error) {
            this.logger.error(`Failed to update order items: ${error.message}`);
            throw error;
        }
    }
}
