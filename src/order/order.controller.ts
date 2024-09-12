import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order.command';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderService } from './services/order.service';

@Controller('order')
export class OrderController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly orderService: OrderService,
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

    // // postgreSQL에서 가져오는 방법
    // @Get(':userId')
    // async getOrders(@Param('userId') userId: number) {
    //     const query = new GetOrderQuery(userId);
    //     const orders = await this.queryBus.execute(query);
    //     return orders;
    // }

    // mongoDB에서 읽기
    // 사용자별 전체 주문 목록
    @Get(':userId')
    async getOrders(@Param('userId') userId: number) {
        return this.orderService.getOrdersByUserId(userId);
    }

    /*
    요청: 주문 취소
    결과: 주문 내역(주문 시간 등), 주문 상세 내역(상품 정보 등) 삭제
    */
}