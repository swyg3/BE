import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class GetProductByDiscountRateDto {
  @IsString()
  @IsOptional()
  where__id_more_than?: string;

  @IsIn(["desc"])
  @IsOptional()
  order__discountRate: "desc" = "desc";

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)  
  take: number = 5;
}
