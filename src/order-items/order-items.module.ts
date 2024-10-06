import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { DynamooseModule } from "nestjs-dynamoose";
//import { UpdateOrderCommandHandler } from "src/order/commands/handlers/update-order.command-handler";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { UpdateOrderItemsEventHandler } from "./events/handlers/update-order-items.event-handler";
import { OrderItemsController } from "./order-items.controller";
import { GetOrderItemQueryHandler } from "./queries/handlers/get-order-item.query-handler";
import { OrderItemsViewSchema } from "./schemas/order-items-view.schema";
import { OrderViewSchema } from "src/order/schemas/order-view.schema";

@Module({
  imports: [
    EventSourcingModule,
    CqrsModule,
    DynamooseModule.forFeature([
      { name: "OrderView", schema: OrderViewSchema },
    ]),
    DynamooseModule.forFeature([
      { name: "OrderItemsView", schema: OrderItemsViewSchema },
    ]),
    ConfigModule.forRoot(),
  ],
  controllers: [OrderItemsController],
  providers: [
    GetOrderItemQueryHandler,
    UpdateOrderItemsEventHandler,
    //UpdateOrderCommandHandler,
  ],
})
export class OrderItemsModule {}
