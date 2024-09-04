import { Controller, Post, Body, Get, Param, UseGuards, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from './dtos/register-user.dto';
import { RegisterUserCommand } from './commands/commands/register-user.command';
import { GetUserProfileQuery } from './queries/queries/get-user-profile.query';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateUserProfileCommand } from './commands/commands/update-user-profile.command';
import { ApiResponse } from 'src/shared/interfaces/api-response.interface';
import { ValidateUUID } from 'src/shared/decorators/validate-uuid.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<ApiResponse<{ userId: string }>>  {
    const { email, password, name, phoneNumber } = registerUserDto;
    const userId = await this.commandBus.execute(new RegisterUserCommand(email, password, name, phoneNumber));
    return { 
      success: true,
      data: {
        userId
      }
     };
  }

  //@UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUserProfile(@ValidateUUID('id') id: string): Promise<ApiResponse<any>> {
    const userProfile = await this.queryBus.execute(new GetUserProfileQuery(id));
    return {
      success: true,
      data: userProfile
    }
  }

  //@UseGuards(JwtAuthGuard)
  @Patch('profile/:id')
  async updateUserProfile(
    @ValidateUUID('id') id: string,
    @Body() updateData: UpdateUserProfileDto
  ): Promise<ApiResponse> {
    await this.commandBus.execute(new UpdateUserProfileCommand(id, updateData));
    return {
      success: true,
      message: '성공적으로 프로필 정보를 수정하였습니다.'
      };
  }
}