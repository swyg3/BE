import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn, IsNotEmpty } from "class-validator";

export class OAuthCallbackDto {
  @ApiProperty({ description: "Authorization Code" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: "사용자 유형 (user 또는 seller)" })
  @IsString()
  @IsIn(["user", "seller"])
  userType: string;
}
