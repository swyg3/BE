import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetProductByDiscountRate {
    @IsString()
    @IsOptional()
    where__id_more_than?: string;

    @IsIn(['asc', 'desc'])
    @IsOptional()
    order__discountRate: 'asc' | 'desc' = 'asc';

    @IsNumber()
    @IsOptional()
    take: number = 5;
}
