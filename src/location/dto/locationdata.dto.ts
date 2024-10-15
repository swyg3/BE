import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class LocationDataDto {
  @ApiProperty({
    example: '127.1393124',
    description: '경도 (문자열 형태의 숫자)',
    type: String,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({
    example: '37.6059693',
    description: '위도 (문자열 형태의 숫자)',
    type: String,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({
    example: true,
    description: 'GPS 동의 여부',
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  agree: boolean;
}