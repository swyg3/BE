export class UpdateProductCommand {
    constructor(
      public readonly Id: number,
      public readonly updates: {
        name?: string;
        productImageUrl?: string;
        description?: string;
        originalPrice?: number;
        discountedPrice?: number;
      },
    ) {}
  }
  