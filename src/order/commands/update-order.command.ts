export class UpdateOrderCommand {
    constructor(
        public readonly orderId: string,
        public readonly totalAmount?: number,
        public readonly totalPrice?: number,
        public readonly pickupTime?: Date,
        public readonly paymentMethod?: string,
        public readonly status?: string,
    ) {}
}