import { ApiProperty } from "@nestjs/swagger";
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
  @ApiProperty({
    description: "수정할 판매자 이메일",
    example: "seller@example.com",
    format: "email",
    required: false,
  })
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty({
    description: "수정할 판매자 이름",
    example: "김철수",
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(50, { message: "이름은 최대 50자까지 가능합니다." })
  name?: string;

  @ApiProperty({
    description: "수정할 휴대폰 번호 (하이픈 제외)",
    example: "01087654321",
    required: false,
    pattern: "^\\d{10,11}$",
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, {
    message: "유효한 휴대폰 번호 형식이 아닙니다.",
  })
  phoneNumber?: string;

  @ApiProperty({ description: "수정할 매장명", required: false })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "상점 이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(100, { message: "매장 이름은 최대 100자까지 가능합니다." })
  storeName?: string;

  @ApiProperty({ description: "수정할 매장 주소", required: false })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: "상점 주소는 최소 5자 이상이어야 합니다." })
  @MaxLength(200, { message: "매장 주소는 최대 200자까지 가능합니다." })
  storeAddress?: string;

  @ApiProperty({ description: "수정할 매장 전화번호", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,11}$/, {
    message: "유효한 매장 전화번호 형식이 아닙니다.",
  })
  storePhoneNumber?: string;

  @IsBoolean()
  isBusinessNumberVerified?: boolean;

  @IsBoolean()
  isEmailVerified?: boolean;
}
