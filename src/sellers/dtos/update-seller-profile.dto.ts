import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  isEmail,
  IsEmail,
  IsBoolean,
} from "class-validator";

export class UpdateSellerProfileDto {

  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(50, { message: "이름은 최대 50자까지 가능합니다." })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, {
    message: "유효한 휴대폰 번호 형식이 아닙니다.",
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "상점 이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(100, { message: "상점 이름은 최대 100자까지 가능합니다." })
  storeName?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: "상점 주소는 최소 5자 이상이어야 합니다." })
  @MaxLength(200, { message: "상점 주소는 최대 200자까지 가능합니다." })
  storeAddress?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,11}$/, {
    message: "유효한 상점 전화번호 형식이 아닙니다.",
  })
  storePhoneNumber?: string;

  @IsBoolean()
  isBusinessNumberVerified?: boolean;

  @IsBoolean()
  isEmailVerified?: boolean;
}
