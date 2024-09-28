import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-itmes/entities/order-items.entity";
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
        const { orderId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items } = command;

        // 1. 주문 내역 찾기
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }

        // 2. 주문 수정
        if (totalAmount !== undefined) order.totalAmount = totalAmount;
        if (totalPrice !== undefined) order.totalPrice = totalPrice;
        if (pickupTime) order.pickupTime = pickupTime;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (status) order.status = status;

        // 3. 수정된 주문 저장
        const updatedOrder = await this.orderRepository.save(order);
        this.logger.log(`주문 업데이트 완료: ${updatedOrder.id}`);

        // 4. 주문 아이템 수정 (선택 사항)
        if (items && items.length > 0) {
            for (const item of items) {
                await this.orderItemsRepository.update({ orderId, productId: item.productId }, {
                    quantity: item.quantity,
                    price: item.price
                });
            }
            this.logger.log(`주문 아이템 업데이트 완료: ${orderId}`);
        }

        // 5. 주문 수정 이벤트 생성
        const event = new UpdateOrderEvent(
            updatedOrder.id,
            {
                id: updatedOrder.id,
                userId: updatedOrder.userId,
                totalAmount: updatedOrder.totalAmount,
                totalPrice: updatedOrder.totalPrice,
                paymentMethod: updatedOrder.paymentMethod,
                status: updatedOrder.status,
                items: items ? items.map(item => ({
                    orderId: updatedOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })) : [],
                pickupTime: updatedOrder.pickupTime,
                createdAt: order.createdAt,
                updatedAt: new Date(),
            },
            1
        );

        // 6. 이벤트 발행
        this.eventBusService.publishAndSave(event);
    }
}