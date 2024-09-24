import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateOrderItemDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    price: number;
}