import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  ForbiddenException,
  Patch,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { UpdateNotificationCommand } from "./commands/update-notification.command";
import { DeleteNotificationCommand } from "./commands/delete-notification.command";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "../decorators/get-user.decorator";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { CustomResponse } from "../interfaces/api-response.interface";
import { ValidateUUID } from "../decorators/validate-uuid.decorator";
import { GetLatestNotificationsQuery } from "./queries/get-latest-by-userId.query";
import { NotificationView } from "./notification.repository";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "최신 알림 10개 조회" })
  @ApiResponse({
    status: 200,
    description: "최신 알림 조회 성공",
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
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @Get(":id")
  async getLatestNotifications(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse<NotificationView[]>> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 알림만 조회할 수 있습니다.");
    }
    const notifications = await this.queryBus.execute(
      new GetLatestNotificationsQuery(id),
    );
    return {
      success: true,
      data: notifications,
    };
  }

  @ApiOperation({ summary: "단일 알림 읽음 상태 변경" })
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
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @ApiParam({ name: "messageId", type: "string", description: "알림 ID" })
  @Patch(":id/read/:messageId")
  async markNotificationAsRead(
    @Param("id") id: string,
    @Param("messageId") messageId: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 알림만 변경할 수 있습니다.");
    }
    await this.commandBus.execute(new UpdateNotificationCommand(id, messageId));
    return {
      success: true,
      message: "알림 상태가 성공적으로 변경되었습니다.",
    };
  }

  @ApiOperation({ summary: "모든 알림 삭제" })
  @ApiResponse({
    status: 200,
    description: "모든 알림 삭제 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "모든 알림이 성공적으로 삭제되었습니다.",
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @Delete(":id")
  async deleteAllNotifications(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 알림만 삭제할 수 있습니다.");
    }
    await this.commandBus.execute(new DeleteNotificationCommand(id));
    return {
      success: true,
      message: "모든 알림이 성공적으로 삭제되었습니다.",
    };
  }
}
