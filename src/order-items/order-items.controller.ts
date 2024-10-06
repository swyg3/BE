import { Controller, Get, Logger, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetOrderItemQuery } from './queries/get-order-item.query';

@Controller('order-items')
export class OrderItemsController {
    private readonly logger = new Logger(OrderItemsController.name);

    constructor(
        private readonly queryBus: QueryBus,
    ) {}

    @Get(':orderId')
    async getOrderItems(@Param('orderId') orderId: string) {
        this.logger.log(`Fetching order items for orderId: ${orderId}`);

        try {
            const result = await this.queryBus.execute(
                new GetOrderItemQuery(orderId)
            );
            this.logger.log(`Successfully get order items: ${JSON.stringify(result)}`);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            this.logger.error(`Failed to get order items: ${error.message}`);
            return {
                success: false,
                message: `Failed to get order items: ${error.message}`,
            };
        }
    }
}
