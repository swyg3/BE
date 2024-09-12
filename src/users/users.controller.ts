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
import { ApiResponse } from "src/shared/interfaces/api-response.interface";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";

@Controller("users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("register")
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<ApiResponse<{ userId: string }>> {
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

  @Get("profile/:id")
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<any>> {
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

  @UseGuards(JwtAuthGuard)
  @Patch("profile/:id")
  async updateUserProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<ApiResponse> {
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
