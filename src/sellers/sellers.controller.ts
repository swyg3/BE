import { Controller, Post, Body, Get, Patch } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiResponse } from "../shared/interfaces/api-response.interface";
import { RegisterSellerDto } from "./dtos/register-seller.dto";
import { RegisterSellerCommand } from "./commands/commands/register-seller.command";
import { ValidateUUID } from "src/shared/decorators/validate-uuid.decorator";
import { GetSellerProfileQuery } from "./queries/queries/get-seller-profile.query";
import { UpdateSellerProfileDto } from "./dtos/update-seller-profile.dto";
import { UpdateSellerProfileCommand } from "./commands/commands/update-seller-profile.command";

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


  //@UseGuards(JwtAuthGuard)
  @Get("profile/:id")
  async getSellerProfile(
    @ValidateUUID("id") id: string,
  ): Promise<ApiResponse<any>> {
    const sellerProfile = await this.queryBus.execute(
      new GetSellerProfileQuery(id),
    );
    return {
      success: true,
      data: sellerProfile,
    };
  }

    //@UseGuards(JwtAuthGuard)
    @Patch("profile/:id")
    async updateSellerProfile(
      @ValidateUUID("id") id: string,
      @Body() updateData: UpdateSellerProfileDto,
    ): Promise<ApiResponse> {
      await this.commandBus.execute(new UpdateSellerProfileCommand(id, updateData));
      return {
        success: true,
        message: "성공적으로 프로필 정보를 수정하였습니다.",
      };
    }
}
