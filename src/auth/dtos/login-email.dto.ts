import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString } from "class-validator";

export class LoginEmailDto {
  @ApiProperty({ description: "로그인 이메일" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "비밀번호" })
  @IsString()
  password: string;

  @ApiProperty({ description: "사용자 유형" })
  @IsIn(["user", "seller"])
  userType: "user" | "seller";
}
