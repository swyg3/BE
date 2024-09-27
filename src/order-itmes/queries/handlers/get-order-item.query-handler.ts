import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DynamoDB } from "aws-sdk"; // AWS SDK에서 DynamoDB 사용
import { OrderItemsViewModel } from "src/order-itmes/schemas/order-items-view.schema";
import { GetOrderItemQuery } from "../get-order-item.query";

@QueryHandler(GetOrderItemQuery)
export class GetOrderItemQueryHandler implements IQueryHandler<GetOrderItemQuery> {
    private readonly dynamoDB: DynamoDB.DocumentClient;

    constructor(
        @Inject(DynamoDB) private readonly dynamoDBClient: DynamoDB.DocumentClient
    ) {
        this.dynamoDB = dynamoDBClient;
    }

    async execute(query: GetOrderItemQuery): Promise<typeof OrderItemsViewModel[]> {
        const params = {
            TableName: "OrderItemsView", // DynamoDB의 테이블 이름
            FilterExpression: "orderId = :orderId", // orderId 필터
            ExpressionAttributeValues: {
                ":orderId": query.orderId, // 쿼리에서 받은 orderId
            },
        };

        const result = await this.dynamoDB.scan(params).promise(); // 모든 주문 항목을 스캔
        return (result.Items || []) as typeof OrderItemsViewModel[]; // 반환된 아이템을 OrderItemsViewModel 타입으로 변환하여 반환
    }
}