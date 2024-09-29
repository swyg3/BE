import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { OrderItemsView } from "src/order/repositories/order.repository";
import { GetOrderItemQuery } from "../get-order-item.query";

@QueryHandler(GetOrderItemQuery)
export class GetOrderItemQueryHandler implements IQueryHandler<GetOrderItemQuery> {
    constructor(
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, {}> // Dynamoose 모델 주입
    ) {}

    async execute(query: GetOrderItemQuery): Promise<OrderItemsView[]> {
        const result = await this.orderItemsViewModel.query("orderId")
            .eq(query.orderId) // orderId에 해당하는 항목을 쿼리
            .exec(); // Dynamoose 쿼리 실행

        return result; // 결과 반환
    }
}