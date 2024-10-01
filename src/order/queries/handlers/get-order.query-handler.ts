import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { OrderView } from "src/order/repositories/order.repository";
import { GetOrderQuery } from "../get-order.query";

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery> {
    private readonly logger = new Logger(GetOrderQueryHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, {}>
    ) {}

    async execute(query: GetOrderQuery): Promise<OrderView[]> {
        const result = await this.orderViewModel.query("userId")
            .eq(Number(query.userId))
            .exec();

        this.logger.log(`Fetched orders for userId ${query.userId}: ${JSON.stringify(result)}`);
        return result;
    }
}