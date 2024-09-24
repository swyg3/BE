import { Controller, Get, Param } from '@nestjs/common';
import { OrderItemService } from './services/order-item.service';

@Controller('order-itmes')
export class OrderItmesController {
    constructor(
        private readonly orderItemService: OrderItemService
    ) {}

    // 사용자별 선택한 주문 목록의 상세 주문 내용
    @Get(':orderId')
    async getOrderItems(@Param('orderId') orderId: string) {
        return this.orderItemService.getOrderItemsByOrderId(orderId);
    }
}