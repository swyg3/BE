import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { Repository } from "typeorm";
import { DeleteOrderCommand } from "../delete-order.command";

@Injectable()
@CommandHandler(DeleteOrderCommand)
export class DeleteOrderCommandHandler implements ICommandHandler<DeleteOrderCommand> {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
    ) {}

    async execute(command: DeleteOrderCommand): Promise<any> {
        const { id } = command;

        // 1. 주문 및 주문 상세 삭제
        await this.orderRepository.delete({ id: id })
        await this.orderItemsRepository.delete({ orderId: id });
        
        // 2. 주문 수량 만큼 재고 추가
    }
}