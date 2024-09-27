import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DynamoDB } from "aws-sdk";
import { OrderViewModel } from "src/order/schemas/order-view.schema"; // 수정된 import
import { GetOrderQuery } from "../get-order.query";

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery> {
    private readonly dynamoDB: DynamoDB.DocumentClient;

    constructor(
        @Inject(DynamoDB) private readonly dynamoDBClient: DynamoDB.DocumentClient
    ) {
        this.dynamoDB = dynamoDBClient;
    }

    async execute(query: GetOrderQuery): Promise<typeof OrderViewModel[]> {
        const params = {
            TableName: "OrderView", // DynamoDB의 테이블 이름
            FilterExpression: "userId = :userId", // userId 필터
            ExpressionAttributeValues: {
                ":userId": query.userId, // 쿼리에서 받은 userId
            },
        };

        // 모든 주문을 스캔
        const result = await this.dynamoDB.scan(params).promise();

        // 반환된 아이템을 OrderViewModel 타입으로 변환하여 반환
        return (result.Items || []) as typeof OrderViewModel[];
    }
}