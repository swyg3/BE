// import { Controller, Get, Logger, Param } from '@nestjs/common';
// import { QueryBus } from '@nestjs/cqrs';
// import { GetOrderItemQuery } from './queries/get-order-item.query';

// @Controller('order-items')
// export class OrderItemsController {
//     private readonly logger = new Logger(OrderItemsController.name);

//     constructor(
//         private readonly queryBus: QueryBus,
//     ) {}

//     @Get(':orderId')
//     async getOrderItems(@Param('orderId') orderId: string) {
//         this.logger.log(`Fetching order items for orderId: ${orderId}`);

//         try {
//             const result = await this.queryBus.execute(
//                 new GetOrderItemQuery(orderId)
//             );
//             this.logger.log(`Successfully get order items: ${JSON.stringify(result)}`);
//             return {
//                 success: true,
//                 data: result,
//             };
//         } catch (error) {
//             this.logger.error(`Failed to get order items: ${error.message}`);
//             return {
//                 success: false,
//                 message: `Failed to get order items: ${error.message}`,
//             };
//         }
//     }
// }

import { Controller, Get, HttpException, HttpStatus, Logger, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { GetOrderItemQuery } from './queries/get-order-item.query';

@ApiTags('OrderItems')
@Controller('order-items')
export class OrderItemsController {
    private readonly logger = new Logger(OrderItemsController.name);

    constructor(
        private readonly queryBus: QueryBus,
    ) {}

    @ApiOperation({
        summary: "사용자별 주문 아이템 조회",
        description: "JWT 토큰을 사용하여 사용자가 자신의 주문 ID로 주문 항목을 조회합니다.",
    })
    @ApiResponse({
        status: 200,
        description: "주문 아이템 조회 성공",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                data: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            itemId: {
                                type: "string",
                                example: "item12345",
                            },
                            productId: {
                                type: "string",
                                example: "product12345",
                            },
                            quantity: { type: "number", example: 2 },
                            price: { type: "number", example: 50 },
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 403,
        description: "금지됨 - 사용자 ID 불일치",
    })
    @ApiResponse({
        status: 404,
        description: "주문 아이템을 찾을 수 없음",
    })
    @ApiResponse({
        status: 500,
        description: "주문 아이템 조회 중 서버 오류가 발생했습니다.",
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':orderId')
    async getOrderItems(
        @Param('orderId') orderId: string,
        @GetUser() user: JwtPayload,
    ) {
        this.logger.log(`주문 ID: ${orderId}에 대한 주문 항목을 사용자: ${user.userId}가 조회하고 있습니다.`);

        try {
            const order = await this.queryBus.execute(new GetOrderItemQuery(orderId));

            // 주문이 존재하는지 확인
            if (!order) {
                this.logger.warn(`주문 ID: ${orderId}에 대한 주문을 찾을 수 없습니다.`);
                throw new HttpException(
                    `주문 ID: ${orderId}에 대한 주문을 찾을 수 없습니다.`,
                    HttpStatus.NOT_FOUND,
                );
            }

            this.logger.log(`주문 ID: ${orderId}에 대한 주문 항목을 성공적으로 조회했습니다.`);
            return {
                success: true,
                data: order,
            };
        } catch (error) {
            this.logger.error(`주문 ID ${orderId}에 대한 주문 항목 조회 중 오류 발생: ${error.message}`);
            throw new HttpException(
                `주문 항목 조회 실패: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
