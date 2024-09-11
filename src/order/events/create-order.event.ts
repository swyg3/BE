export class CreateOrderEvent {
    constructor(
        public readonly userId: number,
        public readonly sellerId: number,
        public readonly totalAmount: number,
        public readonly pickupTime: Date,
        public readonly paymentMethod: string,
        public readonly status: string,
        public readonly items: any,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}
}