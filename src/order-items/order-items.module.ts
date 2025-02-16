import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DynamooseModule } from "nestjs-dynamoose";
import { Order } from "src/order/entities/order.entity";
import { OrderViewSchema } from "src/order/schemas/order-view.schema";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { OrderItems } from "./entities/order-items.entity";
import { GetOrderItemQueryHandler } from "./queries/handlers/get-order-item.query-handler";
import { OrderItemsViewSchema } from "./schemas/order-items-view.schema";
import { OrderItemsViewRepository } from "./order-items.view.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItems, Event]),
    DynamooseModule.forFeature([{ name: "OrderView", schema: OrderViewSchema }]),
    DynamooseModule.forFeature([{ name: "OrderItemsView", schema: OrderItemsViewSchema }]),
    CqrsModule,
    ConfigModule.forRoot(),
    EventSourcingModule,
  ],
  providers: [
    GetOrderItemQueryHandler,
    OrderItemsViewRepository
  ],  
  exports: [OrderItemsViewRepository],

})
export class OrderItemsModule {}