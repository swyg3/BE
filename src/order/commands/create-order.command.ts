export class CreateOrderCommand {
    constructor(
        public readonly userId: number,
        public readonly totalAmount: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: string,
        public readonly status: string
    ) {}
}