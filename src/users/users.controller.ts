import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
  ForbiddenException,
  Delete,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { RegisterUserCommand } from "./commands/commands/register-user.command";
import { GetUserProfileQuery } from "./queries/queries/get-user-profile.query";
import { UpdateUserProfileDto } from "./dtos/update-user-profile.dto";
import { UpdateUserProfileCommand } from "./commands/commands/update-user-profile.command";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DeleteUserCommand } from "./commands/commands/delete-user.command";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "사용자 등록" })
  @ApiResponse({
    status: 201,
    description: "사용자 등록 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      },
    },
  })
  @ApiBody({
    type: RegisterUserDto,
    description: "사용자 등록 정보",
    examples: {
      example1: {
        value: {
          email: "user@example.com",
          password: "StrongPassword123!",
          pwConfirm: "StrongPassword123!",
          name: "홍길동",
          phoneNumber: "01012345678",
        },
        summary: "유효한 사용자 등록 정보",
      },
    },
  })
  @Post("register")
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<CustomResponse<{ userId: string }>> {
    const { email, password, pwConfirm, name, phoneNumber } = registerUserDto;
    const userId = await this.commandBus.execute(
      new RegisterUserCommand(email, password, pwConfirm, name, phoneNumber),
    );
    return {
      success: true,
      data: {
        userId,
      },
    };
  }

  @ApiOperation({ summary: "사용자 프로필 조회" })
  @ApiResponse({
    status: 200,
    description: "프로필 조회 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "홍길동" },
            phoneNumber: { type: "string", example: "01012345678" },
          },
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @ApiBearerAuth()
  @Get("profile/:id")
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse<any>> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 프로필만 조회할 수 있습니다.");
    }
    const userProfile = await this.queryBus.execute(
      new GetUserProfileQuery(id),
    );
    return {
      success: true,
      data: userProfile,
    };
  }

  @ApiOperation({ summary: "사용자 프로필 수정" })
  @ApiResponse({
    status: 200,
    description: "프로필 수정 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "성공적으로 프로필 정보를 수정하였습니다.",
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: "수정할 사용자 프로필 정보",
    examples: {
      example1: {
        value: {
          name: "김철수",
          phoneNumber: "01098765432",
        },
        summary: "수정할 프로필 정보 예시",
      },
    },
  })
  @ApiBearerAuth()
  @Patch("profile/:id")
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 프로필만 수정할 수 있습니다.");
    }
    await this.commandBus.execute(new UpdateUserProfileCommand(id, updateData));
    return {
      success: true,
      message: "성공적으로 프로필 정보를 수정하였습니다.",
    };
  }

  @ApiOperation({ summary: "회원 탈퇴" })
  @ApiResponse({
    status: 200,
    description: "회원 탈퇴 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "성공적으로 회원 탈퇴 처리되었습니다." },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @ApiBearerAuth()
  @Delete("deactivate/:id")
  @UseGuards(JwtAuthGuard)
  async deactivateUser(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 계정만 탈퇴할 수 있습니다.");
    }
    await this.commandBus.execute(new DeleteUserCommand(id));
    return {
      success: true,
      message: "성공적으로 회원 탈퇴 처리되었습니다.",
    };
  }

  @Patch("settings/gps/:id")
  @UseGuards(JwtAuthGuard)
  async updateUserLocation(
      @ValidateUUID("id") id: string,
      @GetUser() user: JwtPayload,
      @Body() body: { agree: boolean },
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("본인 확인이 필요합니다.");
    }
    await this.commandBus.execute(new UpdateUserLocationCommand(id, body.agree));
    return {
      success: true,
      message: "성공적으로 GPS 동의여부를 수정하였습니다.",
    };
  }
}
