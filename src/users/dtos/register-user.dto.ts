import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
} from "class-validator";

export class RegisterUserDto {
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 입력 항목입니다." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "비밀번호는 필수 입력 항목입니다." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  @MaxLength(20, { message: "비밀번호는 최대 20자까지 가능합니다." })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "비밀번호는 대문자, 소문자, 숫자 또는 특수 문자를 포함해야 합니다.",
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: "비밀번호 확인은 필수 입력 항목입니다." })
  @MinLength(8, { message: "비밀번호 확인은 최소 8자 이상이어야 합니다." })
  @MaxLength(20, { message: "비밀번호 확인은 최대 20자까지 가능합니다." })
  pwConfirm: string;

  @IsString()
  @IsNotEmpty({ message: "닉네임은 필수 입력 항목입니다." })
  @MinLength(8, { message: "닉네임은 최소 2자 이상이어야 합니다." })
  @MaxLength(20, { message: "닉네임은 최대 20자까지 가능합니다." })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "휴대폰 번호는 필수 입력 항목입니다." })
  @Matches(/^[0-9]{10,11}$/, {
    message: "유효한 휴대폰 번호 형식이 아닙니다.",
  })
  phoneNumber: string;
}
