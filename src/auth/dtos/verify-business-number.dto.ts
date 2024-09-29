import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyBusinessNumberDto {
  @ApiProperty({ description: "판매자 이메일" })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ description: "사업자 등록 번호" })
  @IsString()
  businessNumber: string;
}
