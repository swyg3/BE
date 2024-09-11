import { Category } from "src/product/product.category";

export class ProductCreatedEvent {
    
    constructor(
      public readonly id: number,
      public readonly sellerId: number,
      public readonly category: Category,
      public readonly name: string,
      public readonly productImageUrl: string,
      public readonly description: string,
      public readonly originalPrice: number,
      public readonly discountedPrice: number,
      public readonly discountRate: number,
      public readonly availableStock: number,
      public readonly expirationDate: Date,
      public readonly created_at: Date,
      public readonly updated_at: Date,
      
    ) {}
  }