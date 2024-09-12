import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
} from "class-validator";

export class RegisterSellerDto {
  @ApiProperty({
    description: "판매자 이메일",
    example: "seller@example.com",
    format: "email",
  })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 입력 항목입니다." })
  email: string;

  @ApiProperty({
    description: "비밀번호 (최소 8자, 대소문자, 숫자, 특수문자 포함)",
    example: "StrongPass1234!",
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: "비밀번호는 필수 입력 항목입니다." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  @MaxLength(20, { message: "비밀번호는 최대 20자까지 가능합니다." })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  password: string;

  @ApiProperty({
    description: "비밀번호 확인",
    example: "StrongPass1234!",
  })
  @IsString()
  @IsNotEmpty({ message: "비밀번호 확인은 필수 입력 항목입니다." })
  @MinLength(8, { message: "비밀번호 확인은 최소 8자 이상이어야 합니다." })
  @MaxLength(20, { message: "비밀번호 확인은 최대 20자까지 가능합니다." })
  pwConfirm: string;

  @ApiProperty({
    description: "판매자 이름",
    example: "홍길동",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: "이름은 필수 입력 항목입니다." })
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다." })
  @MaxLength(50, { message: "이름은 최대 50자까지 가능합니다." })
  name: string;

  @ApiProperty({
    description: "휴대폰 번호 (하이픈 제외)",
    example: "01012345678",
    pattern: "^\\d{10,11}$",
  })
  @IsString()
  @IsNotEmpty({ message: "휴대폰 번호는 필수 입력 항목입니다." })
  @Matches(/^[0-9]{10,11}$/, {
    message: "유효한 휴대폰 번호 형식이 아닙니다.",
  })
  phoneNumber: string;

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
