import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class SearchProductsDto {
    @ApiProperty({ description: '검색어' })
    @IsString()
    searchTerm: string;
  
    @ApiProperty({ 
      enum: ['discountRate', 'distance', 'distanceDiscountScore'], 
      description: '정렬 기준' 
    })
    @IsEnum(['discountRate', 'distance', 'distanceDiscountScore'])
    sortBy: 'discountRate' | 'distance' | 'distanceDiscountScore';
  
    @ApiProperty({ enum: ['asc', 'desc'], description: '정렬 순서' })
    @IsEnum(['asc', 'desc'])
    order: 'asc' | 'desc';
  
    @ApiProperty({ minimum: 1, description: '한 페이지당 항목 수' })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit: number;
  
    @ApiProperty({ required: false, description: '다음 페이지 시작 키' })
    @IsOptional()
    @IsString()
    exclusiveStartKey?: string;
  
    @ApiProperty({ required: false, description: '이전 페이지 키' })
    @IsOptional()
    @IsString()
    previousPageKey?: string;
  }