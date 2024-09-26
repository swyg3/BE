export class UpdateOrderDto {
    orderId?: string;
    totalAmount?: number;
    totalPrice?: number;
    pickupTime?: Date;
    paymentMethod?: string;
    status?: string;
}