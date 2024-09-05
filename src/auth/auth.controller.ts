import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from 'src/shared/decorators/throttle.decorator';
import { RequestEmailVerificationDto } from './dtos/request-email-verify.dto';
import { RequestEmailVerificationCommand } from './commands/commands/request-email-verify.command';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { VerifyEmailCommand } from './commands/commands/verify-email.command';
import { ApiResponse } from 'src/shared/interfaces/api-response.interface';


@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('request-verification')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1분에 5번만 요청 가능
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto): Promise<ApiResponse> {
    await this.commandBus.execute(new RequestEmailVerificationCommand(dto.email));
    return {
      success: true,
      message: '인증 메일이 성공적으로 발송되었습니다.',
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ApiResponse> {
    const isVerified = await this.commandBus.execute(new VerifyEmailCommand(dto.email, dto.verificationCode));
      return {
        success: isVerified,
        message: isVerified ? '인증에 성공하였습니다.' : '인증에 실패하였습니다.',
      };
    }
}