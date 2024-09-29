import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Category } from '../product.category';
import { ApiProperty } from '@nestjs/swagger';

export class GetCategoryDto {
  @ApiProperty({
    enum: Category,
    description: '조회할 상품의 카테고리',
    example: Category,
  })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({
    enum: ['discountRate', 'createdAt'],
    description: '정렬 기준',
    example: 'discountRate',
  })
  @IsEnum(['discountRate', 'createdAt'])
  sortBy: 'discountRate' | 'createdAt';

  @ApiProperty({
    enum: ['asc', 'desc'],
    description: '정렬 순서',
    example: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';

  @ApiProperty({
    type: Number,
    description: '반환할 최대 항목 수',
    required: false,
    example: 10,
  })
  @IsInt()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    type: String,
    description: '다음 페이지 조회를 위한 시작 키',
    required: false,
  })
  @IsString()
  @IsOptional()
  exclusiveStartKey?: string;

  @ApiProperty({
    type: String,
    description: '이전 페이지 조회를 위한 키',
    required: false,
  })
  @IsString()
  @IsOptional()
  previousPageKey?: string;
}