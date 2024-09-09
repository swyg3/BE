import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Repository } from "typeorm";
import { GetOrderItemsQuery } from "../get-order-items.query";

@QueryHandler(GetOrderItemsQuery)
export class GetOrderItemsHandler implements IQueryHandler<GetOrderItemsQuery> {
    constructor(
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>
    ) {}

    async execute(query: GetOrderItemsQuery): Promise<OrderItems[]> {
        return this.orderItemsRepository.find({ where: { orderId: query.orderId } });
    }
}