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
import { ApiResponse } from "../shared/interfaces/api-response.interface";
import { RegisterSellerDto } from "./dtos/register-seller.dto";
import { RegisterSellerCommand } from "./commands/commands/register-seller.command";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { GetSellerProfileQuery } from "./queries/queries/get-seller-profile.query";
import { UpdateSellerProfileDto } from "./dtos/update-seller-profile.dto";
import { UpdateSellerProfileCommand } from "./commands/commands/update-seller-profile.command";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import { JwtPayload } from "src/shared/interfaces/jwt-payload.interface";

@Controller("sellers")
export class SellersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("register")
  async registerSeller(
    @Body() registerSellerDto: RegisterSellerDto,
  ): Promise<ApiResponse<{ sellerId: string }>> {
    const {
      email,
      password,
      pwConfirm,
      name,
      phoneNumber,
      storeName,
      storeAddress,
      storePhoneNumber,
    } = registerSellerDto;

    const sellerId = await this.commandBus.execute(
      new RegisterSellerCommand(
        email,
        password,
        pwConfirm,
        name,
        phoneNumber,
        storeName,
        storeAddress,
        storePhoneNumber,
      ),
    );

    return {
      success: true,
      data: {
        sellerId,
      },
    };
  }

  @Get("profile/:id")
  @UseGuards(JwtAuthGuard)
  async getSellerProfile(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<any>> {
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

  @Patch("profile/:id")
  @UseGuards(JwtAuthGuard)
  async updateSellerProfile(
    @ValidateUUID("id") id: string,
    @Body() updateData: UpdateSellerProfileDto,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse> {
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
