export class ProductUpdatedEvent {
    constructor(
      public readonly Id: number,
      public readonly name?: string,
      public readonly productImageUrl?: string,
      public readonly description?: string,
      public readonly originalPrice?: number,
      public readonly discountedPrice?: number
    ) {}
  }
  