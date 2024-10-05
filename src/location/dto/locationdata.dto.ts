import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDataDto {
  @ApiProperty({
    description: '경도',
    example: '126.9779692',
  })
  @IsNotEmpty({ message: '경도는 필수 입력값입니다.' })
  @IsString({ message: '경도는 문자열이어야 합니다.' })
  longitude: string;

  @ApiProperty({
    description: '위도',
    example: '37.5662952',
  })
  @IsNotEmpty({ message: '위도는 필수 입력값입니다.' })
  @IsString({ message: '위도는 문자열이어야 합니다.' })
  latitude: string;

}