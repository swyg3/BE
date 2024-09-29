import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserProfileDto {

  @ApiProperty({
    description: "수정할 구매자 이름",
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

}
