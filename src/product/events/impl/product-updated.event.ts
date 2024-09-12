export class ProductUpdatedEvent {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly productImageUrl?: string,
    public readonly description?: string,
    public readonly originalPrice?: number,
    public readonly discountedPrice?: number,
    public readonly discountRate?: number,
    public readonly availableStock?: number,
    public readonly expirationDate?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
