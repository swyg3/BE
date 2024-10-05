import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order.command';
import { DeleteOrderCommand } from './commands/delete-order.command';
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
    //@UseGuards(JwtAuthGuard)
    async createOrder(@Body() createOrderDto: CreateOrderDto, /*@GetUser() user: JwtPayload*/) {
        const { id, userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items } = createOrderDto;
        //const userId = user.userId;
    
        try {
            const result = await this.commandBus.execute(
                new CreateOrderCommand(id, userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items)
            );
        } catch (error) {
            this.logger.error(`Error creating order: ${error.message}`);
            throw new HttpException('Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    

    // 사용자별 전체 주문 목록
    @Get(':userId')
    async getOrders(@Param('userId') userId: string) {
        try {
            const result = await this.queryBus.execute(new GetOrderQuery(userId));
            return result;
        } catch (error) {
            this.logger.error(`Error fetching orders for user ${userId}: ${error.message}`);
            throw new HttpException('Failed to fetch orders', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 주문 내역 수정
    @Patch(':id')
    async updateOrders(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        const { totalAmount, totalPrice, pickupTime, paymentMethod, status } = updateOrderDto;
    }

    // 주문 취소
    @Delete(':id')
    async cancelOrders(@Param('id') id: string) {
        this.logger.log(`Cancelling order with ID: ${id}`);

        try {
            const result = await this.commandBus.execute(new DeleteOrderCommand(id));
            return result;
        } catch (error) {
            this.logger.error(`Error cancelling order with ID ${id}: ${error.message}`);
            throw new HttpException('Failed to cancel order', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}