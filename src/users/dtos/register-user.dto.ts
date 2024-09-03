import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: '비밀번호는 대소문자 및 숫자를 포함한 8자리로 작성해주세요.'
  })
  password: string;

  @IsString()
  name: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: '휴대폰 번호는 10자리 혹은 11자리로 작성해주세요.'
  })
  phoneNumber: string;
}