import { Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { Status } from "src/order/enums/order.enum";
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderCommand } from "../create-order.command";

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly logger = new Logger(CreateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly commandBus: CommandBus
    ) {}

    async execute(command: CreateOrderCommand): Promise<Order> {
        const { userId, totalAmount, totalPrice, pickupTime, paymentMethod, items } = command;

        // 1. 주문 생성
        const newOrder = new Order();
        newOrder.userId = userId;
        newOrder.totalAmount = totalAmount;
        newOrder.totalPrice = totalPrice;
        newOrder.pickupTime = pickupTime;
        newOrder.paymentMethod = paymentMethod;
        // 초기값 진행중 pending
        newOrder.status = Status.PENDING;
        // 현재 시간으로 설정
        newOrder.createdAt = new Date();

        const saveOrder = await this.orderRepository.save(newOrder);

        // 2. 주문 내역 생성
        const orderItems = items.map(item => {
            const orderItem = new OrderItems();
            orderItem.orderId = uuidv4();
            orderItem.productId = item.productId;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            return orderItem;
        });

        await this.orderItemsRepository.save(orderItems);

        // 2. 이벤트 발생
        this.logger.log('Order created, publishing event...');

        return saveOrder;
    }
}