import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class UpdateUserProfileDto {
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-\d{3,4}-\d{4}$/, {
    message: "휴대폰 번호는 10자리 혹은 11자리로 작성해주세요.",
  })
  phoneNumber?: string;

  @IsBoolean()
  isEmailVerified?: boolean;
}
