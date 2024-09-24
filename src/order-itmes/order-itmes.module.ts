import { Module } from '@nestjs/common';
import { OrderItmesController } from './order-itmes.controller';

@Module({
  controllers: [OrderItmesController],
})
export class OrderItmesModule {
}
