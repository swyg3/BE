import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";

export class LoginOAuthDto {
  @ApiProperty({ description: "OAuth 제공자 (예: google, kakao)" })
  @IsString()
  @IsIn(["google", "kakao"])
  provider: string;

  @ApiProperty({ description: "사용자 유형 (user 또는 seller)" })
  @IsString()
  @IsIn(["user", "seller"])
  userType: string;

  @ApiProperty({ description: "OAuth 액세스 토큰" })
  @IsString()
  accessToken: string;
}
