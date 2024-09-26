import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Category } from '../product.category';

export class GetCategoryDto {
  @IsEnum(Category)
  category: Category;

  @IsEnum(['discountRate', 'createdAt'])
  sortBy: 'discountRate' | 'createdAt';

  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  exclusiveStartKey?: string;

  @IsString()
  @IsOptional()
  previousPageKey?: string;
}
