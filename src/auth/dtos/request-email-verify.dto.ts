import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestEmailVerificationDto {
  @ApiProperty({ description: "인증을 요청할 이메일 주소" })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 입력 항목입니다." })
  email: string;
}
