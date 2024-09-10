import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestEmailVerificationDto {
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 입력 항목입니다." })
  email: string;
}
