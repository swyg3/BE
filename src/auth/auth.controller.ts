import {
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Controller,
  Res,
  Param,
  Query,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
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
import { OAuthCallbackDto } from "./dtos/oauth-callback.dto";
import { Response } from "express";
import { OAuthCallbackCommand } from "./commands/commands";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import { GetUser } from "src/shared/decorators/get-user.decorator";

@Controller("auth")
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

  @Post("login-email")
  async loginEmail(
    @Body() loginDto: LoginEmailDto,
    @Req() req,
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

  // Authorization code를 OAuth Token으로 교환하는 과정
  @Get("login/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Res() res: Response,
    @Query("userType") userType?: string,
    @Query("state") state?: string,
  ) {
    const oauthCallbackDto: OAuthCallbackDto = { provider, code };
    const result = await this.commandBus.execute(
      new OAuthCallbackCommand(oauthCallbackDto),
    );

    // state에서 userType 추출 - CSRF 공격 방지
    const decodedState = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8"),
    );
    const decodedUserType = decodedState.userType;

    // 리다이렉트 시 userType을 명시적으로 전달
    res.redirect(
      `/login-oauth?provider=${provider}&access_token=${result.accessToken}&user_type=${userType || decodedUserType}`,
    );

    return {
      success: true,
      message: `${userType || decodedUserType} / ${provider} 콜백 처리 성공`,
      data: result,
    };
  }

  /**
   * OAuth Token을 사용하여 소셜 사용자 정보(email, name, phone ...)을 가져와서
   * (1) JWT 토큰을 발급하고,
   * (2) 데이터베이스와 이벤트 저장소에 저장
   * (3) 로그인 이벤트를 발행
   */
  @Post("login-oauth")
  async loginOAuth(@Body() loginOAuthDto: LoginOAuthDto): Promise<ApiResponse> {
    console.log("Received DTO:", loginOAuthDto);
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
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: JwtPayload): Promise<ApiResponse> {
    const { userId, accessToken, userType } = user;
    await this.commandBus.execute(
      new LogoutCommand(userId, accessToken, userType),
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
  @UseGuards(JwtAuthGuard)
  async verifyBusinessNumber(
    @GetUser() user: JwtPayload,
    @Body() dto: VerifyBusinessNumberDto,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new VerifyBusinessNumberCommand(user.userId, dto.businessNumber),
    );
    return {
      success: true,
      message: "사업자 등록번호가 성공적으로 검증되었습니다.",
      data: result,
    };
  }

  @Post("complete-profile")
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @GetUser() user: JwtPayload,
    @Body() profileDto: CompleteSellerProfileDto,
  ): Promise<ApiResponse> {
    const result = await this.commandBus.execute(
      new CompleteSellerProfileCommand(user.userId, profileDto),
    );
    return {
      success: true,
      message: "판매자 프로필이 성공적으로 완성되었습니다.",
      data: result,
    };
  }
}
