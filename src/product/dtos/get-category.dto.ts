import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Category } from "../product.category";
import { Type } from "class-transformer";

export enum SortByOption {
  DiscountRate = 'discountRate',
  Distance = 'distance',
  DistanceDiscountScore = 'distanceDiscountScore'
}

export class FindProductsByCategoryDto {
  @ApiProperty({ enum: Category, description: '제품 카테고리' })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ enum: SortByOption, description: '정렬 기준' })
  @IsEnum(SortByOption)
  sortBy: SortByOption;

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

  @ApiProperty({ required: false, description: '위도' })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiProperty({ required: false, description: '경도' })
  @IsOptional()
  @IsString()
  longitude?: string;
}