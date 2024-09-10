import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/order/entities/order.entity";
import { Repository } from "typeorm";
import { GetOrderQuery } from "../get-order.query";

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery> {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {}

    async execute(query: GetOrderQuery): Promise<Order[]> {
        return this.orderRepository.find({ where: { userId: query.userId } });
    }
}