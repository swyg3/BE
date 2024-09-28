import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DynamooseModule } from 'nestjs-dynamoose';
import { CreateOrderCommandHandler } from './commands/handlers/create-order.command-handler';
import { DeleteOrderCommandHandler } from './commands/handlers/delete-order.command-handler';
import { CreateOrderEventHandler } from './events/handlers/create-order.event-handler';
import { OrderController } from './order.controller';
import { GetOrderQueryHandler } from './queries/handlers/get-order.query-handler';
import { OrderViewModel } from './schemas/order-view.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([{ name: 'OrderView', schema: OrderViewModel.schema }]),
    CqrsModule,
    ConfigModule.forRoot(),
  ],
  controllers: [OrderController],
  providers: [CreateOrderCommandHandler, GetOrderQueryHandler, DeleteOrderCommandHandler, CreateOrderEventHandler]
})
export class OrderModule {}
