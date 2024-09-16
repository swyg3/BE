import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUrl,
  IsDate,
  IsDateString,
} from "class-validator";
import { Category } from "../product.category";
import { Seller } from "src/sellers/entities/seller.entity";

export class CreateProductDto {
  @IsNumber()
  sellerId: string;

  @IsEnum(Category, {
    message: "카테고리는 유효한 값이어야 합니다.",
  })
  category: Category;

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl(
    {},
    {
      message: "상품 이미지 URL은 유효한 URL 형식이어야 합니다.",
    },
  )
  productImageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, {
    message: "원래 가격은 0보다 커야 합니다.",
  })
  originalPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: "할인 가격은 0보다 커야 합니다.",
  })
  discountedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: "재고는 0보다 커야 합니다.",
  })
  quantity?: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: "만기일은 유효한 날짜 문자열이어야 합니다.",
    },
  )
  expirationDate?: string;
}
