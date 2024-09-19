import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order.command';
import { DeleteOrderCommand } from './commands/delete-order.command';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderService } from './services/order.service';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly orderService: OrderService,
    ) {}

    @Post()
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items } = createOrderDto;

        return this.commandBus.execute(
            new CreateOrderCommand(userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items)
        );
    }

    // 사용자별 전체 주문 목록
    @Get(':userId')
    async getOrders(@Param('userId') userId: number) {
        return this.orderService.getOrdersByUserId(userId);
    }

    // 사용자별 선택한 주문 목록의 상세 주문 내용

    // orders의 id == order_items의 orderId(외래키)
    @Delete(':id')
    async deleteOrder(@Param('id') id: string) {
        await this.commandBus.execute(new DeleteOrderCommand(id));
    }
}