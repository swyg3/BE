import { Logger } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/order/entities/order.entity";
import { Repository } from 'typeorm';
import { CreateOrderCommand } from "../create-order.command";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly logger = new Logger(CreateOrderHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: CreateOrderCommand): Promise<any> {
        const { userId, totalAmount, pickupTime, paymentMethod, status } = command;

        // const newOrder = this.orderRepository.create({
        //     userId,
        //     totalAmount,
        //     pickupTime,
        //     paymentMethod,
        //     status,
        //     createdAt: new Date(),
        // });

        // const savedOrder = await this.orderRepository.save(newOrder);

        // 주문이 생성된 후 이벤트 발생
        this.logger.log('Order created, publishing event...');
    }
}