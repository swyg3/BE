import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetOrderItemQuery } from './queries/get-order-item.query';

@Controller('order-items')
export class OrderItmesController {
    constructor(
        private readonly queryBus: QueryBus,
    ) {}

    // 사용자별 주문 상세 목록
    @Get(':orderId')
    async getOrderItems(@Param('orderId') orderId: string) {
        return this.queryBus.execute(
            new GetOrderItemQuery(orderId)
        );
    }
}