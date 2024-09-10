import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItems } from 'src/order-items/entities/order-items.entity';
import { CreateOrderCommandHandler } from './commands/handlers/create-order.command-handler';
import { DeleteOrderCommandHandler } from './commands/handlers/delete-order.command-handler';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { GetOrderQueryHandler } from './queries/handlers/get-order.query-handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    TypeOrmModule.forFeature([OrderItems]),
    CqrsModule
  ],
  controllers: [OrderController],
  providers: [CreateOrderCommandHandler, GetOrderQueryHandler, DeleteOrderCommandHandler]
})
export class OrderModule {}
