import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn, IsNotEmpty } from "class-validator";

export class OAuthCallbackDto {
  @ApiProperty({ description: "OAuth 제공자 (예: google, kakao)" })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ description: "Authorization Code" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: "상태" })
  @IsString()
  state?: string;
}
