export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly updates: {
      name?: string;
      productImageUrl?: string;
      description?: string;
      originalPrice?: number;
      discountedPrice?: number;
      quantity?: number;
      expirationDate?: Date;
      updatedAt?: Date;
    },
  ) {}
}
