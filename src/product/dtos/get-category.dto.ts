import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Category } from "../product.category";

export class GetCategoryDto {
    @IsString()
    @IsOptional()
    where__id_more_than?: string;

    @IsEnum(Category)
    category: Category;

    @IsIn(["desc"])
    @IsOptional()
    order__discountRate?: "desc" = "desc";

    @IsIn(["desc"])
    @IsOptional()
    order__createdAt?: "desc" = "desc";

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => value ? Number(value) : undefined)
    take: number = 8;
    
    constructor(partial: Partial<GetCategoryDto>) {
        Object.assign(this, partial);
      }
}