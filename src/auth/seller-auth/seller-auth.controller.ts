import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { BaseAuthController } from "../shared/base-auth.controller";
import { ApiResponse } from "src/shared/interfaces/api-response.interface";
import { CompleteSellerProfileCommand } from "./commands/complete-seller-profile.command";
import { VerifyBusinessNumberCommand } from "./commands/verify-business-number.command";
import { CompleteSellerProfileDto } from "./dtos/complete-seller-profile.dto";
import { VerifyBusinessNumberDto } from "./dtos/verify-business-number.dto";

@Controller("sellers/auth")
export class SellerAuthController extends BaseAuthController {
  constructor(protected readonly commandBus: CommandBus) {
    super(commandBus);
  }

  protected getUserType(): "user" | "seller" {
    return "seller";
  }

  @Post("verify-business-number")
  async verifyBusinessNumber(
    @Body() verifyBusinessNumberDto: VerifyBusinessNumberDto,
  ): Promise<ApiResponse> {
    const { businessNumber } = verifyBusinessNumberDto;
    await this.commandBus.execute(
      new VerifyBusinessNumberCommand(businessNumber),
    );
    return {
      success: true,
      message: "사업자 등록번호가 성공적으로 검증되었습니다.",
    };
  }

  @Post("complete-profile")
  async completeProfile(
    @Body() profileDto: CompleteSellerProfileDto,
  ): Promise<ApiResponse> {
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
