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

    // 주문 생성
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

    // 주문 취소
    @Delete(':id')
    async cancelOrders(@Param('id') id: string) {
        return this.commandBus.execute(
            new DeleteOrderCommand(id)
        );
    }
}