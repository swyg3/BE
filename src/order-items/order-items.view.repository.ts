import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { OrderItemsView } from 'src/order/events/handlers/create-order.event-handler';

@Injectable()
export class OrderItemsViewRepository {
    constructor(
        @InjectModel('OrderItemsView')
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>
    ) {}

    async findProductIdsByOrderId(orderId: string): Promise<string[]> {
        const result = await this.orderItemsViewModel.query('orderId')
            .using('OrderIdIndex')
            .eq(orderId)
            .exec();

        return result.map(item => item.productId);
    }
}