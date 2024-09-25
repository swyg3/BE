import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class DyGetProductByDiscountRateInputDto {
  @ApiProperty({ enum: ['asc', 'desc'], description: '정렬 순서' })
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';

  @ApiProperty({ type: Number, description: '조회할 항목 수' })
  @IsNumber()
  @IsOptional()
  limit: number = 20;

  @ApiProperty({ type: String, description: '다음 페이지 조회를 위한 키', required: false })
  @IsString()
  @IsOptional()
  exclusiveStartKey?: string;

  @ApiProperty({ enum: ['forward', 'backward'], description: '페이지네이션 방향', required: false })
  @IsEnum(['forward', 'backward'])
  @IsOptional()
  paginationDirection?: 'forward' | 'backward' = 'forward';
}