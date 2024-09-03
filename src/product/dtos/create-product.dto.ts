import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsUrl } from 'class-validator';
import { Category } from '../product.category'; 

export class CreateProductDto {
  @IsNumber()
  sellerId: number;

  @IsEnum(Category, {
    message: '카테고리는 유효한 값이어야 합니다.'
  })
  category: Category;

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl({}, {
    message: '상품 이미지 URL은 유효한 URL 형식이어야 합니다.'
  })
  productImageUrl: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0, {
    message: '원래 가격은 0보다 커야 합니다.'
  })
  originalPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: '할인 가격은 0보다 커야 합니다.'
  })
  discountedPrice?: number;
}
