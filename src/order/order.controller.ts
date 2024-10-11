import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    UseGuards
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetOrderItemQuery } from "src/order-items/queries/get-order-item.query";
import { GetProductByIdQuery } from "src/product/queries/impl/get-prouct-by-id.query";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderCommand } from "./commands/create-order.command";
import { DeleteOrderCommand } from "./commands/delete-order.command";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { GetOrderQuery } from "./queries/get-order.query";

@ApiTags("Orders")
@Controller("order")
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    // 주문 생성
    @ApiOperation({
        summary: "주문 생성",
        description: "새로운 주문을 생성합니다.",
    })
    @ApiBody({
        type: CreateOrderDto,
        description: "주문 생성 정보",
        examples: {
        example1: {
            value: {
            totalAmount: 100,
            totalPrice: 100,
            pickupTime: "2024-09-09T18:00:00Z",
            paymentMethod: "CASH",
            status: "PENDING",
            items: [
                { productId: "22a1b7b1-546d-4f1e-95b4-21b3583a7ef9", quantity: 2, price: 50 },
                { productId: "3d32b618-7c61-4016-8517-0eee204de8c5", quantity: 1, price: 50 },
            ],
            memo: ["메모1", "메모2"],
            },
            summary: "유효한 주문 생성 정보",
        },
        },
    })
    @ApiResponse({
        status: 201,
        description: "주문 생성 성공",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                data: {
                    type: "object",
                    properties: {
                        orderId: {
                            type: "string",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                        },
                        totalAmount: {
                            type: "number",
                            example: 100,
                        },
                        totalPrice: {
                            type: "number",
                            example: 100,
                        },
                        pickupTime: {
                            type: "string",
                            format: "date-time",
                            example: "2024-09-09T18:00:00Z",
                        },
                        paymentMethod: {
                            type: "string",
                            example: "CASH",
                        },
                        status: {
                            type: "string",
                            example: "PENDING",
                        },
                        memo: {
                            type: "array",
                            items: { type: "string" },
                            example: ["메모1", "메모2"],
                        },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    productId: { type: "string", example: "22a1b7b1-546d-4f1e-95b4-21b3583a7ef9" },
                                    quantity: { type: "number", example: 2 },
                                    price: { type: "number", example: 50 },
                                },
                            },
                            example: [
                                {
                                    productId: "22a1b7b1-546d-4f1e-95b4-21b3583a7ef9",
                                    quantity: 2,
                                    price: 50,
                                },
                                {
                                    productId: "3d32b618-7c61-4016-8517-0eee204de8c5",
                                    quantity: 1,
                                    price: 50,
                                },
                            ],
                        },
                    },
                },
            },
        },
    }) 
    @ApiResponse({
        status: 500,
        description: "주문 생성 중 서버 오류가 발생했습니다.",
    })
    @ApiOperation({
        summary: "주문 생성",
        description: "새로운 주문을 생성합니다.",
    })
    @ApiResponse({
        status: 401,
        description: "로그인이 필요합니다.",
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @GetUser() user: JwtPayload,
    ) {
        if (!user || !user.userId) {
            throw new HttpException(
                "로그인되어 있지 않습니다. 주문을 생성하려면 로그인해야 합니다.",
                HttpStatus.UNAUTHORIZED,
            );
        }

        const {
        totalAmount,
        totalPrice,
        pickupTime,
        paymentMethod,
        status,
        items,
        memo
        } = createOrderDto;

    try {
        const id = uuidv4();
        const result = await this.commandBus.execute(
            new CreateOrderCommand(
                id,
                user.userId,
                totalAmount,
                totalPrice,
                pickupTime,
                paymentMethod,
                status,
                items,
                memo,
            ),
        );
    } catch (error) {
    this.logger.error(`Error creating order: ${error.message}`);
    throw new HttpException(
        "Failed to create order",
        HttpStatus.INTERNAL_SERVER_ERROR,
    );
    }
}

    // 사용자별 전체 주문 목록
    @ApiOperation({
        summary: "사용자별 주문 목록 조회",
        description: "JWT 토큰을 사용하여 사용자의 모든 주문 목록을 조회합니다.",
    })
    @ApiResponse({
        status: 200,
        description: "주문 목록 조회 성공",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                data: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "deec95a1-7811-41cd-85d4-97ea4256bc11" },
                            totalAmount: { type: "number", example: 100 },
                            createdAt: { type: "string", format: "date-time", example: "2024-10-09 17:12:15" },
                            pickupTime: { type: "string", format: "date-time", example: "2024-09-10 03:00:00" },
                            paymentMethod: { type: "string", example: "CASH" },
                            userId: { type: "string", example: "dcdc2d66-2e59-4f99-920e-91222106b9e7" },
                            status: { type: "string", example: "PENDING" },
                            updatedAt: { type: "string", format: "date-time", example: "2024-10-09 17:12:15" },
                            totalPrice: { type: "number", example: 100 },
                            memo: {
                                type: "array",
                                items: { type: "string" },
                                example: ["메모1", "메모2"],
                            },
                        },
                    },
                },
            },
            example: {
                success: true,
                data: [
                    {
                        id: "deec95a1-7811-41cd-85d4-97ea4256bc11",
                        totalAmount: 100,
                        createdAt: "2024-10-09 17:12:15",
                        pickupTime: "2024-09-10 03:00:00",
                        paymentMethod: "CASH",
                        userId: "dcdc2d66-2e59-4f99-920e-91222106b9e7",
                        status: "PENDING",
                        updatedAt: "2024-10-09 17:12:15",
                        totalPrice: 100,
                        memo: ["첫 번째 메모", "두 번째 메모"]
                    },
                    {
                        id: "ff4e87da-6be2-4e7c-8a83-d30a6353e4b1",
                        totalAmount: 150,
                        createdAt: "2024-10-09 17:12:15",
                        pickupTime: "2024-09-10 04:00:00",
                        paymentMethod: "CARD",
                        userId: "dcdc2d66-2e59-4f99-920e-91222106b9e7",
                        status: "COMPLETED",
                        updatedAt: "2024-10-09 17:12:15",
                        totalPrice: 150,
                        memo: ["첫 번째 메모", "두 번째 메모"]
                    },
                ],
            },
        }
    })
    @ApiResponse({
        status: 500,
        description: "주문 목록 조회 중 서버 오류가 발생했습니다.",
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getOrders(@GetUser() user: JwtPayload) {
        try {
            // 주문 목록 조회
            const orders = await this.queryBus.execute(new GetOrderQuery(user.userId));
            this.logger.log('user.userId의 주문 목록 조회:', JSON.stringify(orders));

            // 주문 목록에서 주문 번호
            const orderId = orders[0].id;
            this.logger.log('user.userId의 주문 번호:', JSON.stringify(orderId));

            // 주문 번호로 주문 아이템 ID 조회
            const orderProductIds = await this.queryBus.execute(new GetOrderItemQuery(orderId));
            this.logger.log('user.userId의 주문 아이템 id 조회:', JSON.stringify(orderProductIds));
            
            // 각 주문 아이템 id로 아이템 정보 조회
            const orderItemsInfo = await this.queryBus.execute(new GetProductByIdQuery(orderProductIds[0]));
            this.logger.log('user.userId의 주문 아이템 id로 아이템 정보 조회:', JSON.stringify(orderItemsInfo));

        return {
                success: true,
                data: orders,
                };
            } catch (error) {
                this.logger.error(
                    `Error fetching orders for user ${user.userId}: ${error.message}`,
                );
                throw new HttpException(
                    "Failed to fetch orders",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
    }

  // 주문 취소
    @ApiOperation({
        summary: "주문 취소",
        description: "특정 주문을 취소합니다.",
    })
    @ApiParam({ name: "id", type: "string", description: "주문 ID" })
    @ApiResponse({
        status: 200,
        description: "주문 취소 성공",
        schema: {
        type: "object",
        properties: {
            success: { type: "boolean", example: true },
            message: {
            type: "string",
            example: "성공적으로 주문이 취소되었습니다.",
            },
        },
        },
    })
    @ApiResponse({ status: 403, description: "금지됨 - 사용자 ID 불일치" })
    @ApiResponse({
        status: 500,
        description: "주문 취소 중 서버 오류가 발생했습니다.",
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async cancelOrders(
        @Param("id") id: string,
        @GetUser() user: JwtPayload,
    ) {
        this.logger.log(`Cancelling order with ID: ${id}`);

        try {
        const result = await this.commandBus.execute(new DeleteOrderCommand(id));
        return result;
        } catch (error) {
        this.logger.error(
            `Error cancelling order with ID ${id}: ${error.message}`,
        );
        throw new HttpException(
            "Failed to cancel order",
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }
}