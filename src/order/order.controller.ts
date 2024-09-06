import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('order')
export class OrderController {

    /*
    요청: 주문 페이지에서 주문하기
    결과: 주문 내역(주문 시간 등), 주문 상세 내역(상품 정보 등) 저장
    */
    @Post()
    orderCreate(): string {
        return '주문 내역 저장(주문 완료)';
    }

    /*
    요청: 마이페이지에서 주문 내역 조회
    결과: 전체 주문 내역 보기(read) select * from Order;
    */
    @Get()
    showOrders(): string {
        return '전체 주문 내역 보기';
    }

    /*
    요청: 주문 취소
    결과: 주문 내역(주문 시간 등), 주문 상세 내역(상품 정보 등) 삭제
    */
    @Delete(':id')
    cancleOrder(@Param('id') id: number): string {
        return '주문 취소';
    }
}