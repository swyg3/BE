import { Post, Body, Get, UseGuards, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { ApiResponse } from "src/shared/interfaces/api-response.interface";
import { RequestEmailVerificationCommand } from "./commands/commands/request-email-verification.command";
import { VerifyEmailCommand } from "./commands/commands/verify-email.command";
import { LoginEmailCommand } from "./commands/commands/login-email.command";
import { LoginOAuthCommand } from "./commands/commands/login-oauth.command";
import { LogoutCommand } from "./commands/commands/logout.command";
import { RefreshTokenCommand } from "./commands/commands/refresh-token.command";
import { RequestEmailVerificationDto } from "./dtos/request-email-verify.dto";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { LoginEmailDto } from "./dtos/login-email.dto";
import { LoginOAuthDto } from "./dtos/login-oauth.dto";
import { CompleteSellerProfileDto } from "./dtos/complete-seller-profile.dto";
import { CompleteSellerProfileCommand } from "./commands/commands/complete-seller-profile.command";
import { VerifyBusinessNumberCommand } from "./commands/commands/verify-business-number.command";
import { VerifyBusinessNumberDto } from "./dtos/verify-business-number.dto";

@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(protected readonly commandBus: CommandBus) {}

  @Post("request-verification")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async requestEmailVerification(
    @Body() dto: RequestEmailVerificationDto,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new RequestEmailVerificationCommand(dto.email),
    );
    return {
      success: true,
      message: result
        ? "인증 메일이 성공적으로 발송되었습니다."
        : "인증 메일 발송에 실패했습니다.",
    };
  }

  @Post("verify-email")
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new VerifyEmailCommand(dto.email, dto.verificationCode),
    );
    return {
      success: true,
      message: result ? "인증에 성공하였습니다." : "인증에 실패하였습니다.",
    };
  }

  @Post("login/email")
  async loginEmail(
    @Body() loginDto: LoginEmailDto,
    @Req() req
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new LoginEmailCommand(loginDto, req),
    );
    return {
      success: true,
      message: "로그인에 성공하였습니다.",
      data: result,
    };
  }

  @Post("login/oauth")
  async loginOAuth(
    @Body() loginOAuthDto: LoginOAuthDto
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new LoginOAuthCommand(loginOAuthDto),
    );

    return {
      success: true,
      message: `${loginOAuthDto.provider} 로그인에 성공하였습니다.`,
      data: result,
    };
  }

  @Post("logout")
  @UseGuards(AuthGuard("jwt"))
  async logout(@Req() req): Promise<ApiResponse> {
    const { userId, accessToken, refreshToken, userType } = req.user;
    await this.commandBus.execute(
      new LogoutCommand(userId, accessToken, refreshToken, userType),
    );
    return {
      success: true,
      message: "로그아웃에 성공하였습니다.",
    };
  }

  @Post("refresh-token")
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );
    return {
      success: true,
      message: "토큰이 갱신되었습니다.",
      data: result,
    };
  }

  @Post("verify-business-number")
  @UseGuards(AuthGuard("jwt"))
  async verifyBusinessNumber(
    @Req() req,
    @Body() dto: VerifyBusinessNumberDto,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new VerifyBusinessNumberCommand(req.user.id, dto.businessNumber),
    );
    return {
      success: true,
      message: "사업자 등록번호가 성공적으로 검증되었습니다.",
      data: result,
    };
  }

  @Post("complete-profile")
  @UseGuards(AuthGuard("jwt"))
  async completeProfile(
    @Req() req,
    @Body() profileDto: CompleteSellerProfileDto,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new CompleteSellerProfileCommand(req.user.id, profileDto),
    );
    return {
      success: true,
      message: "판매자 프로필이 성공적으로 완성되었습니다.",
      data: result,
    };
  }

}
