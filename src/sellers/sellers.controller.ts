import { Controller, Post, Body } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiResponse } from "../shared/interfaces/api-response.interface";
import { RegisterSellerDto } from "./dtos/register-seller.dto";
import { RegisterSellerCommand } from "./commands/commands/register-seller.command";

@Controller("sellers")
export class SellerAuthController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
