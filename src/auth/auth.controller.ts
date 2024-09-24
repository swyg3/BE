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
  BadRequestException,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CustomResponse } from "src/shared/interfaces/api-response.interface";

@ApiTags("Auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(protected readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: "이메일 인증 요청" })
  @ApiResponse({ status: 200, description: "인증 메일 발송 성공" })
  @ApiBody({
    type: RequestEmailVerificationDto,
    description: "이메일 인증 요청 정보",
    examples: {
      example1: {
        value: { email: "user@example.com" },
        summary: "유효한 이메일 주소",
      },
    },
  })
  @Post("request-verification")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async requestEmailVerification(
    @Body() dto: RequestEmailVerificationDto,
  ): Promise<CustomResponse> {
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

  @ApiOperation({ summary: "이메일 인증 확인" })
  @ApiResponse({ status: 200, description: "이메일 인증 성공" })
  @ApiBody({
    type: VerifyEmailDto,
    description: "이메일 인증 확인 정보",
    examples: {
      example1: {
        value: { email: "user@example.com", verificationCode: "123456" },
        summary: "유효한 이메일 주소와 인증 코드",
      },
    },
  })
  @Post("verify-email")
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<CustomResponse> {
    const result = await this.commandBus.execute(
      new VerifyEmailCommand(dto.email, dto.verificationCode),
    );
    return {
      success: true,
      message: result ? "인증에 성공하였습니다." : "인증에 실패하였습니다.",
    };
  }

  @ApiOperation({ summary: "이메일 로그인" })
  @ApiResponse({ status: 200, description: "로그인 성공" })
  @ApiBody({
    type: LoginEmailDto,
    description: "이메일 로그인 정보",
    examples: {
      example1: {
        value: {
          email: "user@example.com",
          password: "StrongPassword123!",
          userType: "user",
        },
        summary: "구매자 로그인 예시",
      },
      example2: {
        value: {
          email: "seller@example.com",
          password: "StrongPassword123!",
          userType: "seller",
        },
        summary: "판매자 로그인 예시",
      },
    },
  })
  @Post("login-email")
  async loginEmail(
    @Body() loginDto: LoginEmailDto,
    @Req() req,
  ): Promise<CustomResponse> {
    req.body.userType = loginDto.userType;
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
  @ApiOperation({ summary: "OAuth 콜백 처리" })
  @ApiResponse({ status: 200, description: "OAuth 콜백 처리 성공" })
  @ApiParam({
    name: "provider",
    enum: ["google", "kakao"],
    description: 'OAuth 제공자. google 또는 kakao 중 하나',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'OAuth 제공자로부터 받은 인증 코드',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'Base64로 인코딩된 userType 정보. 예: eyJ1c2VyVHlwZSI6InVzZXIifQ== (user) 또는 eyJ1c2VyVHlwZSI6InNlbGxlciJ9 (seller)',
  })
  @Get("login-oauth/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ): Promise<void> {

    console.log(`Received OAuth callback - Provider: ${provider}, Code: ${code}, State: ${state}`);

    try {

      if (!state) {
        throw new BadRequestException('Missing state parameter');
      }
      let parsedState: { userType: string };
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      parsedState = JSON.parse(decodedState);

      if (!parsedState || !parsedState.userType) {
        throw new BadRequestException('Invalid state structure');
      }

      const { userType } = parsedState;

      if (userType !== 'user' && userType !== 'seller') {
        throw new BadRequestException('Invalid userType');
      }
      console.log(`Processed userType: ${userType}`);

      const oauthCallbackDto: OAuthCallbackDto = { provider, code, state, userType };
      const result = await this.commandBus.execute(
        new OAuthCallbackCommand(oauthCallbackDto),
      );

      // Base64로 인코딩된 userType을 포함하여 리다이렉트
      const encodedUserType = Buffer.from(userType).toString('base64');
      const redirectUrl = `http://localhost:3000/api/auth/complete-oauth?provider=${provider}&token=${result.oneTimeToken}&userType=${encodedUserType}`;
      console.log(`Redirecting to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
    }
  }

  // OAuth 로그인 최종 단계, 일회용 토큰으로 JWT 발급
  @ApiOperation({ summary: 'OAuth 로그인 완료' })
  @ApiResponse({ status: 200, description: 'OAuth 로그인 완료 및 JWT 발급 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청. userType이 올바르지 않음.' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiQuery({
    name: 'provider',
    required: true,
    description: 'OAuth 제공자. google 또는 kakao 중 하나',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'OAuth 콜백 처리 후 발급된 일회용 토큰',
  })
  @ApiQuery({
    name: 'userType',
    required: true,
    description: 'Base64로 인코딩된 userType 정보. 예: dXNlcg== (user) 또는 c2VsbGVy (seller)',
  })
  @Get("complete-oauth")
  async completeOauth(
    @Query('provider') provider: string,
    @Query('token') oneTimeToken: string,
    @Query('userType') encodedUserType: string,
  ): Promise<CustomResponse> {

    console.log(`complete-oauth 경로에서 일회용 토큰: ${oneTimeToken}`)
    
    const userType = Buffer.from(encodedUserType, 'base64').toString('utf-8');
    console.log(`complete-oauth 경로에서 사용자유형: ${encodedUserType}`)
    
    if (userType !== 'user' && userType !== 'seller') {
      throw new BadRequestException('Invalid userType');
    }

    console.log(`Completing OAuth - Provider: ${provider}, UserType: ${userType}`);

    const result = await this.commandBus.execute(
      new LoginOAuthCommand(provider, oneTimeToken, userType),
    );

    return {
      success: true,
      message: `${result.provider} 로그인에 성공하였습니다.`,
      data: result,
    };
  }

  @ApiOperation({ summary: "로그아웃" })
  @ApiResponse({ status: 200, description: "로그아웃 성공" })
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: JwtPayload): Promise<CustomResponse> {
    const { userId, accessToken, userType } = user;
    await this.commandBus.execute(
      new LogoutCommand(userId, accessToken, userType),
    );
    return {
      success: true,
      message: "로그아웃에 성공하였습니다.",
    };
  }

  @ApiOperation({ summary: "AccessToken 재발급" })
  @ApiResponse({ status: 200, description: "AccessToken 재발급 성공" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        refreshToken: { type: "string" },
      },
    },
    examples: {
      example1: {
        value: { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        summary: "유효한 Refresh Token",
      },
    },
  })
  @Post("refresh-token")
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
  ): Promise<CustomResponse> {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );
    return {
      success: true,
      message: "토큰이 갱신되었습니다.",
      data: result,
    };
  }

  @ApiOperation({ summary: "사업자등록번호 인증" })
  @ApiResponse({ status: 200, description: "사업자등록번호 인증 성공" })
  @ApiBody({
    type: VerifyBusinessNumberDto,
    description:
      "(임시)사업자등록번호 인증 정보: 임시로 'test' 입력하면 무조건 통과",
    examples: {
      example1: {
        value: { email: "seller@example.com", businessNumber: "test" },
        summary: "유효한 이메일과 사업자등록번호",
      },
    },
  })
  @Post("verify-business-number")
  async verifyBusinessNumber(
    @Body() dto: VerifyBusinessNumberDto,
  ): Promise<CustomResponse> {
    const result = await this.commandBus.execute(
      new VerifyBusinessNumberCommand(dto.email, dto.businessNumber),
    );
    return result;
  }

  @ApiOperation({ summary: "판매자 매장정보 추가" })
  @ApiResponse({ status: 200, description: "판매자 매장정보 추가 성공" })
  @ApiBody({
    type: CompleteSellerProfileDto,
    description: "판매자 추가 정보",
    examples: {
      example1: {
        value: {
          email: "seller@example.com",
          storeName: "맥도날드",
          storeAddress: "서울특별시 강남구 테헤란로 123",
          storePhoneNumber: "01012341234",
        },
        summary: "판매자 추가 정보 예시",
      },
    },
  })
  @Post("complete-profile")
  async completeProfile(
    @Body() profileDto: CompleteSellerProfileDto,
  ): Promise<CustomResponse> {
    const result = await this.commandBus.execute(
      new CompleteSellerProfileCommand(profileDto),
    );
    return {
      success: true,
      message: "판매자 프로필이 성공적으로 완성되었습니다.",
      data: result,
    };
  }
}
