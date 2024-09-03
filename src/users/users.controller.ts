import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from './dtos/register-user.dto';
import { RegisterUserCommand } from './commands/commands/register-user.command';
import { GetUserProfileQuery } from './queries/queries/get-user-profile.query';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const { email, password, name, phoneNumber } = registerUserDto;
    const userId = await this.commandBus.execute(new RegisterUserCommand(email, password, name, phoneNumber));
    return { userId, message: 'User registered successfully' };
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserProfileQuery(id));
  }
}