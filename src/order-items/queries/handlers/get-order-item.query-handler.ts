import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { OrderItemsView } from "src/order/events/handlers/create-order.event-handler";
import { GetOrderItemQuery } from "../get-order-item.query";

@QueryHandler(GetOrderItemQuery)
export class GetOrderItemQueryHandler implements IQueryHandler<GetOrderItemQuery> {
    constructor(
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }> // Model 정의 수정
    ) {}

    async execute(query: GetOrderItemQuery): Promise<string[]> {
        const result = await this.orderItemsViewModel.query("orderId")
            .using("OrderIdIndex")
            .eq(query.orderId)
            .exec();
        
        const productIds = result.map(item => item.productId);
        return productIds;
    }
}