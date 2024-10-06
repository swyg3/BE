import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { UpdateOrderEvent } from "src/order/events/update-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from 'typeorm';
import { UpdateOrderCommand } from "../update-order.command";

@Injectable()
@CommandHandler(UpdateOrderCommand)
export class UpdateOrderCommandHandler implements ICommandHandler<UpdateOrderCommand> {
    private readonly logger = new Logger(UpdateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: UpdateOrderCommand): Promise<any> {
        const { id, userId, totalAmount, totalPrice, pickupTime, items, paymentMethod, status } = command;

        try {
            // 1. 주문 찾기
            const order = await this.orderRepository.findOne({ where: { id } });
            if (!order) {
                throw new Error(`Order with ID ${id} not found.`);
            }

            // 2. 주문 수정
            if (totalAmount !== undefined) order.totalAmount = totalAmount;
            if (totalPrice !== undefined) order.totalPrice = totalPrice;
            if (pickupTime) order.pickupTime = pickupTime;
            if (paymentMethod) order.paymentMethod = paymentMethod;
            if (status) order.status = status;

            // 3. 수정된 주문 저장
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Updated Order: ${JSON.stringify(updatedOrder)}`);

            // 4. aggregate에서 주문 수정 이벤트 생성
            const event = new UpdateOrderEvent(
                updatedOrder.id,
                {
                    id: updatedOrder.id,
                    userId: updatedOrder.userId,
                    totalAmount: updatedOrder.totalAmount,
                    totalPrice: updatedOrder.totalPrice,
                    paymentMethod: updatedOrder.paymentMethod,
                    status: updatedOrder.status,
                    items: items.map(item => ({
                        orderId: updatedOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    pickupTime: updatedOrder.pickupTime,
                    createdAt: updatedOrder.createdAt,
                    updatedAt: new Date(),
                },
                1
            );

            // 5. 이벤트 발행
            await this.eventBusService.publishAndSave(event);
            this.logger.log(`Order Update Event Published: ${JSON.stringify(event)}`);
        } catch (error) {
            this.logger.error(`Failed to update order: ${error.message}`);
            throw error;
        }
    }
}
