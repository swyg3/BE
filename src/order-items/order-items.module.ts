import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DynamooseModule } from 'nestjs-dynamoose';
import { OrderItemsController } from './order-items.controller';
import { GetOrderItemQueryHandler } from './queries/handlers/get-order-item.query-handler';
import { OrderItemsViewSchema } from './schemas/order-items-view.schema';

@Module({
  imports: [
    CqrsModule,
    DynamooseModule.forFeature([{ name: "OrderItemsView", schema: OrderItemsViewSchema }]),
    ConfigModule.forRoot(),
  ],
  controllers: [OrderItemsController],
  providers: [GetOrderItemQueryHandler],
})
export class OrderItemsModule {
}
