import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
  ForbiddenException,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { RegisterUserCommand } from "./commands/commands/register-user.command";
import { GetUserProfileQuery } from "./queries/queries/get-user-profile.query";
import { UpdateUserProfileDto } from "./dtos/update-user-profile.dto";
import { UpdateUserProfileCommand } from "./commands/commands/update-user-profile.command";
import { IApiResponse } from "src/shared/interfaces/api-response.interface";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "사용자 등록" })
  @ApiResponse({ status: 201, description: "사용자 등록 성공" })
  @Post("register")
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<IApiResponse<{ userId: string }>> {
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
  @ApiResponse({ status: 200, description: "프로필 조회 성공" })
  @Get("profile/:id")
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<IApiResponse<any>> {
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
  @ApiResponse({ status: 200, description: "프로필 수정 성공" })
  @UseGuards(JwtAuthGuard)
  @Patch("profile/:id")
  async updateUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<IApiResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 프로필만 수정할 수 있습니다.");
    }
    await this.commandBus.execute(new UpdateUserProfileCommand(id, updateData));
    return {
      success: true,
      message: "성공적으로 프로필 정보를 수정하였습니다.",
    };
  }
}
