import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyBusinessNumberDto {
  @ApiProperty({ description: "사업자 등록 번호" })
  @IsString()
  businessNumber: string;
}
