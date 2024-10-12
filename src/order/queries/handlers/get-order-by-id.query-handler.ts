import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel, Model } from "nestjs-dynamoose";
import { OrderView } from "src/order/events/handlers/create-order.event-handler";
import { GetOrderByIdQuery } from "../get-order-by-id.query";

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdQueryHandler implements IQueryHandler<GetOrderByIdQuery> {
    private readonly logger = new Logger(GetOrderByIdQueryHandler.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, {}>
    ) {}

    async execute(query: GetOrderByIdQuery): Promise<OrderView[]> {
        const result = await this.orderViewModel.query("id")
            .eq(query.id)
            .exec();

        this.logger.log(`Fetched orders for userId ${query.id}: ${JSON.stringify(result)}`);
        return result;
    }
}