import {
  Controller,
  Get,
  Param,
  UseGuards,
  Put,
  Delete,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { UpdateNotificationCommand } from "./commands/update-notification.command";
import { DeleteNotificationCommand } from "./commands/delete-notification.command";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "../decorators/get-user.decorator";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { CustomResponse } from "../interfaces/api-response.interface";
import { GetNotificationsQuery } from "./queries/get-list-by-userId.query";
import { ValidateUUID } from "../decorators/validate-uuid.decorator";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "사용자 알림 목록 조회" })
  @ApiResponse({
    status: 200,
    description: "알림 목록 조회 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              message: { type: "string", example: "새로운 알림이 있습니다." },
              isRead: { type: "boolean", example: false },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @Get()
  async getNotifications(
    @GetUser() user: JwtPayload,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<CustomResponse<any[]>> {
    const notifications = await this.queryBus.execute(
      new GetNotificationsQuery(user.userId, page, limit),
    );
    return {
      success: true,
      data: notifications,
    };
  }

  @ApiOperation({ summary: "알림 읽음 상태 변경" })
  @ApiResponse({
    status: 200,
    description: "알림 상태 변경 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "알림 상태가 성공적으로 변경되었습니다.",
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "알림 ID" })
  @Put(":id/read")
  async markNotificationAsRead(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    await this.commandBus.execute(
      new UpdateNotificationCommand(id, user.userId, true),
    );
    return {
      success: true,
      message: "알림 상태가 성공적으로 변경되었습니다.",
    };
  }

  @ApiOperation({ summary: "알림 삭제" })
  @ApiResponse({
    status: 200,
    description: "알림 삭제 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "알림이 성공적으로 삭제되었습니다.",
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "알림 ID" })
  @Delete(":id")
  async deleteNotification(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    await this.commandBus.execute(
      new DeleteNotificationCommand(id, user.userId),
    );
    return {
      success: true,
      message: "알림이 성공적으로 삭제되었습니다.",
    };
  }

  @ApiOperation({ summary: "모든 알림 읽음 상태로 변경" })
  @ApiResponse({
    status: 200,
    description: "모든 알림 읽음 처리 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "모든 알림이 읽음 상태로 변경되었습니다.",
        },
      },
    },
  })
  @Put("read-all")
  async markAllNotificationsAsRead(
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    await this.commandBus.execute(
      new UpdateNotificationCommand(null, user.userId, true, true),
    );
    return {
      success: true,
      message: "모든 알림이 읽음 상태로 변경되었습니다.",
    };
  }
}
