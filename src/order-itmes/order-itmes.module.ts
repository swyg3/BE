import { Module } from '@nestjs/common';
import { OrderItmesController } from './order-itmes.controller';
import { GetOrderItemQueryHandler } from './queries/handlers/get-order-item.query-handler';

@Module({
  controllers: [OrderItmesController],
  providers: [GetOrderItemQueryHandler],
})
export class OrderItmesModule {
}
