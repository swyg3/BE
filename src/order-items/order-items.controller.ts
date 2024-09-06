import { Controller, Get, Param } from '@nestjs/common';

@Controller('order-items')
export class OrderItemsController {

    /*
    요청: 선택 주문 내역의 상세 주문 내역 조회
    결과: 상세 주문 내역 보기(read) select * from Order_items;
    */
    @Get(':id')
    showOrderItems(@Param('id') id: number): string {
        return '상세 주문 내역 보기';
    }
}