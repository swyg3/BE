import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
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
          userId: "10040024",
          totalAmount: 100,
          totalPrice: 100,
          pickupTime: "2024-09-09T18:00:00Z",
          paymentMethod: "CASH",
          status: "PENDING",
          items: [
            { productId: 345, quantity: 2, price: 50 },
            { productId: 678, quantity: 1, price: 50 },
          ],
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
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "주문 생성 중 서버 오류가 발생했습니다.",
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    // @GetUser() user: JwtPayload,
  ) {
    const {
      id,
      userId,
      totalAmount,
      totalPrice,
      pickupTime,
      paymentMethod,
      status,
      items,
    } = createOrderDto;
    // if (user.userId !== userId) {
    //     throw new ForbiddenException('자신의 주문만 생성할 수 있습니다.');
    // }

    try {
      const result = await this.commandBus.execute(
        new CreateOrderCommand(
          id,
          userId,
          totalAmount,
          totalPrice,
          pickupTime,
          paymentMethod,
          status,
          items,
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
    description: "특정 사용자의 모든 주문 목록을 조회합니다.",
  })
  @ApiParam({ name: "userId", type: "string", description: "사용자 ID" })
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
              orderId: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              totalAmount: { type: "number", example: 100 },
              totalPrice: { type: "number", example: 100 },
              status: { type: "string", example: "PENDING" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: "금지됨 - 사용자 ID 불일치" })
  @ApiResponse({
    status: 500,
    description: "주문 목록 조회 중 서버 오류가 발생했습니다.",
  })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Get(":userId")
  async getOrders(
    @Param("userId") userId: string,
    // @GetUser() user: JwtPayload,
  ) {
    // if (user.userId !== userId) {
    //     throw new ForbiddenException('자신의 주문만 생성할 수 있습니다.');
    // }

    try {
      const result = await this.queryBus.execute(new GetOrderQuery(userId));
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching orders for user ${userId}: ${error.message}`,
      );
      throw new HttpException(
        "Failed to fetch orders",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // // 주문 내역 수정
  // @Patch(':id')
  // async updateOrders(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @GetUser() user: JwtPayload) {
  //     const { totalAmount, totalPrice, pickupTime, paymentMethod, status } = updateOrderDto;

  //     if (user.userId !== userId) {
  //     throw new ForbiddenException('자신의 주문만 수정할 수 있습니다.');
  //     }

  //     try {
  //         const result = await this.commandBus.execute(
  //             new UpdateOrderCommand(id, userId, totalAmount, totalPrice, pickupTime, paymentMethod, status)
  //         );
  //         return result;
  //     } catch (error) {
  //         this.logger.error(`Error updating order with ID ${orderId}: ${error.message}`);
  //         throw new HttpException('Failed to update order', HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  // }

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
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async cancelOrders(
    @Param("id") id: string,
    // @GetUser() user: JwtPayload,
  ) {
    this.logger.log(`Cancelling order with ID: ${id}`);

    // if (user.userId !== userId) {
    //     throw new ForbiddenException('자신의 주문만 취소할 수 있습니다.');
    // }

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
