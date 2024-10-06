import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class GetProductByDiscountRateInputDto {
  @ApiProperty({ enum: ['asc', 'desc'], description: '정렬 순서' })
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';

  @ApiProperty({ type: Number, description: '조회할 항목 수' })
  @IsNumber()
  @IsOptional()
  limit: number = Number(8);

  @ApiProperty({ type: String, description: '다음 페이지 조회를 위한 키', required: false })
  @IsString()
  @IsOptional()
  exclusiveStartKey?: string;

  @ApiProperty({ type: String, description: '이전 페이지 조회를 위한 키', required: false })
  @IsString()
  @IsOptional()
  previousPageKey?: string;
}