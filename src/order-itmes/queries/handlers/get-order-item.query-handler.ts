import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-itmes/entities/order-items.entity";
import { Repository } from "typeorm";
import { GetOrderItemQuery } from "../get-order-item.query";

@QueryHandler(GetOrderItemQuery)
export class GetOrderItemQueryHandler implements IQueryHandler<GetOrderItemQuery> {
    constructor(
        @InjectRepository(OrderItems)
        private readonly orderItemRepository: Repository<OrderItems>
    ) {}

    async execute(query: GetOrderItemQuery): Promise<OrderItems[]> {
        return this.orderItemRepository.find({ where: { orderId: query.orderId }});
    }
}