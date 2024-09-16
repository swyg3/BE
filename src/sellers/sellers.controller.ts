import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CustomResponse } from "../shared/interfaces/api-response.interface";
import { RegisterSellerDto } from "./dtos/register-seller.dto";
import { RegisterSellerCommand } from "./commands/commands/register-seller.command";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { GetSellerProfileQuery } from "./queries/queries/get-seller-profile.query";
import { UpdateSellerProfileDto } from "./dtos/update-seller-profile.dto";
import { UpdateSellerProfileCommand } from "./commands/commands/update-seller-profile.command";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Sellers")
@Controller("sellers")
export class SellersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "판매자 등록" })
  @ApiResponse({ status: 201, description: "판매자 등록 성공" })
  @Post("register")
  async registerSeller(
    @Body() registerSellerDto: RegisterSellerDto,
  ): Promise<CustomResponse<{ sellerId: string }>> {
    try {
      const result = await this.commandBus.execute(
        new RegisterSellerCommand(registerSellerDto)
      );

      return {
        success: true,
        message: "판매자 등록이 성공적으로 완료되었습니다.",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "판매자 등록 중 오류가 발생했습니다.",
      };
    }
  }

  @ApiOperation({ summary: "판매자 프로필 조회" })
  @ApiResponse({ status: 200, description: "프로필 조회 성공" })
  @Get("profile/:id")
  @UseGuards(JwtAuthGuard)
  async getSellerProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse<any>> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 프로필만 조회할 수 있습니다.");
    }
    const sellerProfile = await this.queryBus.execute(
      new GetSellerProfileQuery(id),
    );
    return {
      success: true,
      data: sellerProfile,
    };
  }

  @ApiOperation({ summary: "판매자 프로필 수정" })
  @ApiResponse({ status: 200, description: "프로필 수정 성공" })
  @Patch("profile/:id")
  @UseGuards(JwtAuthGuard)
  async updateSellerProfile(
    @ValidateUUID("id") id: string,
    @Body() updateData: UpdateSellerProfileDto,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 프로필만 수정할 수 있습니다.");
    }
    await this.commandBus.execute(
      new UpdateSellerProfileCommand(id, updateData),
    );
    return {
      success: true,
      message: "성공적으로 프로필 정보를 수정하였습니다.",
    };
  }
}
