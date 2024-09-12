import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CompleteSellerProfileDto {
  @ApiProperty({ description: "매장명" })
  @IsString()
  storeName: string;

  @ApiProperty({ description: "매장 주소" })
  @IsString()
  storeAddress: string;

  @ApiProperty({ description: "매장 전화번호" })
  @IsString()
  storePhoneNumber: string;
}
