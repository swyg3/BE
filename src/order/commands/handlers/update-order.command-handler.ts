import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Repository } from 'typeorm';
import { UpdateOrderCommand } from '../update-order.command';

@Injectable()
@CommandHandler(UpdateOrderCommand)
export class UpdateOrderCommandHandler implements ICommandHandler<UpdateOrderCommand> {
    private readonly logger = new Logger(UpdateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    async execute(command: UpdateOrderCommand): Promise<any> {
        const { orderId, totalAmount, totalPrice, pickupTime, paymentMethod, status } = command;

        // 주문 내역 찾기
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
        throw new Error(`Order with ID ${orderId} not found.`);
        }

        // 수정할 필드 업데이트
        if (totalAmount) order.totalAmount = totalAmount;
        if (totalPrice) order.totalPrice = totalPrice;
        if (pickupTime) order.pickupTime = pickupTime;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (status) order.status = status;

        // 업데이트된 주문 저장
        return await this.orderRepository.save(order);
    }
}
