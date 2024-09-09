import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order.command';
import { CreateOrderDto } from './dtos/create-order.dto';
import { GetOrderQuery } from './queries/get-order.query';

@Controller('order')
export class OrderController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    /*
    요청: 주문 페이지에서 주문하기
    결과: 주문 내역(주문 시간 등), 주문 상세 내역(상품 정보 등) 저장
    */
    @Post()
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items } = createOrderDto;

        return this.commandBus.execute(
            new CreateOrderCommand(userId, totalAmount, totalPrice, pickupTime, paymentMethod, status, items)
        );
    }

    /*
    요청: 마이페이지에서 주문 내역 조회
    결과: 사용자별 전체 주문 내역 보기(read) select * from Order;
    */
    @Get(':userId')
    async getOrders(@Param('userId') userId: number) {
        const query = new GetOrderQuery(userId);
        const orders = await this.queryBus.execute(query);
        return orders;
    }

    /*
    요청: 주문 취소
    결과: 주문 내역(주문 시간 등), 주문 상세 내역(상품 정보 등) 삭제
    */
    @Delete(':orderId')
    cancelOrder(@Param('orderId') orderId: number) {

    }
}