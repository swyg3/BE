import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderItemDto } from 'src/order-items/dtos/order-items.dto';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    totalAmount: number;

    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    pickupTime: Date;

    @IsNotEmpty()
    @IsString()
    paymentMethod: string;

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    memo: string[];
}