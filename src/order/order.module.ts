import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamooseModule } from 'nestjs-dynamoose';
import { OrderItems } from 'src/order-items/entities/order-items.entity';
import { GetOrderItemQuery } from 'src/order-items/queries/get-order-item.query';
import { GetOrderItemQueryHandler } from 'src/order-items/queries/handlers/get-order-item.query-handler';
import { OrderItemsViewSchema } from 'src/order-items/schemas/order-items-view.schema';
import { GetProductByIdQuery } from 'src/product/queries/impl/get-prouct-by-id.query';
import { Event, EventSourcingModule } from 'src/shared/infrastructure/event-sourcing';
import { CreateOrderCommandHandler } from './commands/handlers/create-order.command-handler';
import { DeleteOrderCommandHandler } from './commands/handlers/delete-order.command-handler';
import { Order } from './entities/order.entity';
import { CreateOrderEventHandler } from './events/handlers/create-order.event-handler';
import { DeleteOrderEventHandler } from './events/handlers/delete-order.event-handler';
import { OrderController } from './order.controller';
import { GetOrderQueryHandler } from './queries/handlers/get-order.query-handler';
import { OrderViewSchema } from './schemas/order-view.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItems, Event]),
    DynamooseModule.forFeature([{ name: "OrderView", schema: OrderViewSchema }]),
    DynamooseModule.forFeature([{ name: "OrderItemsView", schema: OrderItemsViewSchema }]),
    CqrsModule,
    ConfigModule.forRoot(),
    EventSourcingModule,
  ],
  controllers: [OrderController],
  providers: [CreateOrderCommandHandler, GetOrderQueryHandler, CreateOrderEventHandler, DeleteOrderEventHandler, DeleteOrderCommandHandler, GetProductByIdQuery, GetOrderItemQuery, GetOrderItemQueryHandler]
})
export class OrderModule {}
