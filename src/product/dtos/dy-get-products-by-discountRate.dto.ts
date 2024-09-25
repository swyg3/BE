import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
export class DyGetProductByDiscountRateInputDto {
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take: number;

  @IsOptional()
  @IsString()
  exclusiveStartKey?: string;

}