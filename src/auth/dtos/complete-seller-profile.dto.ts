import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CompleteSellerProfileDto {
  @ApiProperty({
    description: "매장명",
    example: "지코바",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: "상점 이름은 필수 입력 항목입니다." })
  @MinLength(2, { message: "상점 이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(100, { message: "상점 이름은 최대 100자까지 가능합니다." })
  storeName: string;

  @ApiProperty({
    description: "매장 주소",
    example: "서울시 서울구 서울동 서울대로 123번길",
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: "상점 주소는 필수 입력 항목입니다." })
  @MinLength(5, { message: "상점 주소는 최소 5자 이상이어야 합니다." })
  @MaxLength(200, { message: "상점 주소는 최대 200자까지 가능합니다." })
  storeAddress: string;

  @ApiProperty({
    description: "매장 전화번호 (하이픈 제외)",
    example: "01012345678 또는 025551234",
    pattern: "^\\d{9,11}$",
  })
  @IsString()
  @IsNotEmpty({ message: "상점 전화번호는 필수 입력 항목입니다." })
  @Matches(/^[0-9]{9,11}$/, {
    message: "유효한 상점 전화번호 형식이 아닙니다.",
  })
  storePhoneNumber: string;
}
