import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '../location.type';

export class UserLocationDto {
  @ApiProperty({ description: '위치 ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '사용자 ID', example: 'user-uuid-string' })
  userId: string;

  @ApiProperty({ description: '위도', example: '37.5662952' })
  latitude: string;

  @ApiProperty({ description: '경도', example: '126.9779692' })
  longitude: string;

  @ApiProperty({ description: '현재 선택한 위치이며 계산에 쓰일 위치인지', example: true })
  isCurrent: boolean;

  @ApiProperty({ 
    description: '위치 타입', 
    enum: LocationType,
    example: LocationType.REALTIME 
  })
  locationType: LocationType;

  @ApiProperty({ description: 'GPS 동의 여부', example: true })
  isAgreed: boolean;

  @ApiProperty({ description: '마지막 업데이트 시간', example: '2023-06-01T12:00:00Z' })
  updatedAt: Date;
}