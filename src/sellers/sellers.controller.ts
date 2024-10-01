import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  ForbiddenException,
  Delete,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DeleteSellerCommand } from "./commands/commands/delete-seller.command";

@ApiTags("Sellers")
@Controller("sellers")
export class SellersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "판매자 등록" })
  @ApiResponse({
    status: 201,
    description: "판매자 등록 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "판매자 등록이 성공적으로 완료되었습니다.",
        },
        data: {
          type: "object",
          properties: {
            sellerId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      },
    },
  })
  @ApiBody({
    type: RegisterSellerDto,
    description: "판매자 등록 정보",
    examples: {
      example1: {
        value: {
          email: "seller@example.com",
          password: "StrongPassword123",
          pwConfirm: "StrongPassword123",
          name: "홍판매",
          phoneNumber: "01012345678",
        },
        summary: "유효한 판매자 등록 정보",
      },
    },
  })
  @Post("register")
  async registerSeller(
    @Body() registerSellerDto: RegisterSellerDto,
  ): Promise<CustomResponse<{ sellerId: string }>> {
    try {
      const result = await this.commandBus.execute(
        new RegisterSellerCommand(registerSellerDto),
      );

      return {
        success: true,
        message: "판매자 등록이 성공적으로 완료되었습니다.",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "판매자 등록 중 오류가 발생했습니다.",
      };
    }
  }

  @ApiOperation({ summary: "판매자 프로필 조회" })
  @ApiResponse({
    status: 200,
    description: "프로필 조회 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            sellerId: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: { type: "string", example: "seller@example.com" },
            name: { type: "string", example: "홍판매" },
            phoneNumber: { type: "string", example: "01012345678" },
            storeName: { type: "string", example: "홍판매의 가게" },
            storeAddress: {
              type: "string",
              example: "서울특별시 강남구 테헤란로 123",
            },
            storePhoneNumber: { type: "string", example: "01012341234" },
          },
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "판매자 ID" })
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 200,
    description: "프로필 수정 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "성공적으로 프로필 정보를 수정하였습니다.",
        },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "판매자 ID" })
  @ApiBody({
    type: UpdateSellerProfileDto,
    description: "수정할 판매자 프로필 정보",
    examples: {
      example1: {
        value: {
          name: "김판매",
          phoneNumber: "01098765432",
          storeName: "김판매의 새로운 가게",
        },
        summary: "수정할 판매자 프로필 정보 예시",
      },
    },
  })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: "회원 탈퇴" })
  @ApiResponse({
    status: 200,
    description: "회원 탈퇴 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "성공적으로 회원 탈퇴 처리되었습니다." },
      },
    },
  })
  @ApiParam({ name: "id", type: "string", description: "사용자 ID" })
  @ApiBearerAuth()
  @Delete("deactivate/:id")
  @UseGuards(JwtAuthGuard)
  async deactivateSeller(
    @ValidateUUID("id") id: string,
    @GetUser() user: JwtPayload,
  ): Promise<CustomResponse> {
    if (user.userId !== id) {
      throw new ForbiddenException("자신의 계정만 탈퇴할 수 있습니다.");
    }
    await this.commandBus.execute(new DeleteSellerCommand(id));
    return {
      success: true,
      message: "성공적으로 회원 탈퇴 처리되었습니다.",
    };
  }
}
