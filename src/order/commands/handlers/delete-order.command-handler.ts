import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { DeleteOrderEvent } from "src/order/events/delete-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from "typeorm";
import { DeleteOrderCommand } from "../delete-order.command";

@Injectable()
@CommandHandler(DeleteOrderCommand)
export class DeleteOrderCommandHandler implements ICommandHandler<DeleteOrderCommand> {
    private readonly logger = new Logger(DeleteOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: DeleteOrderCommand): Promise<any> {
        const { id } = command;

        // 1. 주문 및 주문 아이템 조회
        const order = await this.orderRepository.findOne({ where: { id } });
        const orderItems = await this.orderItemsRepository.find({ where: { orderId: id } });

        if (!order) {
            this.logger.error(`Order with ID ${id} not found.`);
            throw new Error(`Order with ID ${id} not found.`);
        }

        // 2. 주문 및 주문 아이템 삭제
        await this.orderRepository.delete({ id });
        await this.orderItemsRepository.delete({ orderId: id });

        // 3. aggregate에서 주문 등록 이벤트 생성
        const event = new DeleteOrderEvent(
            order.id,
            {
                id: order.id,
                userId: order.userId,
                totalAmount: order.totalAmount,
                totalPrice: order.totalPrice,
                paymentMethod: order.paymentMethod,
                status: 'CANCELLED',
                items: orderItems.map(item => ({
                    id: item.id,
                    orderId: item.orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                pickupTime: order.pickupTime,
                createdAt: order.createdAt,
                updatedAt: new Date(),
            },
            1
        );

        // 4. 이벤트 발행
        await this.eventBusService.publishAndSave(event);
        this.logger.log(`Order deletion event published: ${JSON.stringify(event)}`);
    }
}