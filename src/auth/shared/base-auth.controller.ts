import { Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiResponse } from 'src/shared/interfaces/api-response.interface';
import { RequestEmailVerificationCommand } from './commands/commands/request-email-verify.command';
import { VerifyEmailCommand } from './commands/commands/verify-email.command';
import { LoginEmailCommand } from './commands/commands/login-email.command';
import { LoginOAuthCommand } from './commands/commands/login-oauth.command';
import { LogoutCommand } from './commands/commands/logout.command';
import { RefreshTokenCommand } from './commands/commands/refresh-token.command';
import { RequestEmailVerificationDto } from './dtos/request-email-verify.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { LoginEmailDto } from './dtos/login-email.dto';


@UseGuards(ThrottlerGuard)
export abstract class BaseAuthController {
  constructor(
    protected readonly commandBus: CommandBus
  ) {}

  @Post('request-verification')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new RequestEmailVerificationCommand(dto.email));
    return {
      success: result,
      message: result ? '인증 메일이 성공적으로 발송되었습니다.' : '인증 메일 발송에 실패했습니다.'
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new VerifyEmailCommand(dto.email, dto.verificationCode));
    return {
      success: result,
      message: result ? '인증에 성공하였습니다.' : '인증에 실패하였습니다.'
    };
  }

  @Post('login/email')
  async loginEmail(@Body() loginDto: LoginEmailDto, @Req() req): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new LoginEmailCommand(loginDto, this.getUserType(), 'email', req));
    return {
      success: true,
      message: '로그인에 성공하였습니다.',
      data: result
    };
  }

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(@Req() req) {
    // GoogleStrategy에서 리다이렉트
  }
  @Get('login/google/callback')
  @UseGuards(AuthGuard('google'))
  async loginGoogleCallback(@Req() req): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new LoginOAuthCommand(req.user, 'google', this.getUserType(), 'google', req));
    return {
      success: true,
      message: 'Google 로그인에 성공하였습니다.',
      data: result
    };
  }

  @Get('login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(@Req() req) {
    // KakaoStrategy에서 리다이렉트
  }

  @Get('login/kakao/callboack')
  @UseGuards(AuthGuard('kakao'))
  async loginKakaoCallback(@Req() req): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new LoginOAuthCommand(req.user, 'kakao', this.getUserType(), 'kakao', req));
    return {
      success: true,
      message: 'Kakao 로그인에 성공하였습니다.',
      data: result
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req): Promise<ApiResponse> {
    const { userId, accessToken, refreshToken } = req.user;
    await this.commandBus.execute(new LogoutCommand(userId, accessToken, refreshToken));
    return {
      success: true,
      message: '로그아웃에 성공하였습니다.'
    };
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<ApiResponse> {
    const result = await this.commandBus.execute(new RefreshTokenCommand(refreshToken));
    return {
      success: true,
      message: '토큰이 갱신되었습니다.',
      data: result
    };
  }

  protected abstract getUserType(): 'user' | 'seller';
}