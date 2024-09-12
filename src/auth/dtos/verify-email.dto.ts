import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({ description: "인증할 이메일 주소" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "인증 코드" })
  @IsString()
  @Length(6, 6)
  verificationCode: string;
}
