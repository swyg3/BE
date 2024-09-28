import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order.command';
import { DeleteOrderCommand } from './commands/delete-order.command';
import { UpdateOrderCommand } from './commands/update-order.command';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { GetOrderQuery } from './queries/get-order.query';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    // 주문 생성
    @Post()
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { id, userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items } = createOrderDto;

        return this.commandBus.execute(
            new CreateOrderCommand(id, userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items)
        );
    }

    // 사용자별 전체 주문 목록
    @Get(':userId')
    async getOrders(@Param('userId') userId: number) {
        return this.queryBus.execute(
            new GetOrderQuery(userId)
        );
    }

    // 주문 내역 수정
    @Patch(':id')
    async updateOrders(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        const { orderId, totalAmount, totalPrice, pickupTime, paymentMethod, status } = updateOrderDto;

        return this.commandBus.execute(
            new UpdateOrderCommand(orderId, totalAmount, totalPrice, pickupTime, paymentMethod, status)
        );
    }

    // 주문 취소
    @Delete(':id')
    async cancelOrders(@Param('id') id: string) {
        return this.commandBus.execute(
            new DeleteOrderCommand(id)
        );
    }
}