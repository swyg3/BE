import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Category } from 'src/product/product.category';

export class CreateProductDto {
  @IsNotEmpty()
  @IsNumber()
  sellerId: number;

  @IsNotEmpty()
  @IsEnum(Category, {
    message: '카테고리는 KOREAN, JAPANESE, CHINESE, SNACK 중 하나여야 합니다.'
  })
  category: Category;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  originalPrice: number;

  @IsOptional()
  @IsNumber()
  discountedPrice?: number;

  @IsNotEmpty()
  @IsNumber()
  discountRate: number;

  @IsNotEmpty()
  @IsNumber()
  availableStock: number;

  @IsNotEmpty()
  @IsDate()
  expirationDate: Date;

  @IsNotEmpty()
  @IsDate()
  created_at: Date;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}
export { Category };

