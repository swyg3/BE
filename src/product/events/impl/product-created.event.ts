import { BaseEvent } from "src/shared/infrastructure/event-sourcing";
import { Category } from "src/product/product.category";
import { Seller } from "src/sellers/entities/seller.entity";

export class ProductCreatedEvent implements BaseEvent {
  readonly eventType = "ProductCreated";
  readonly aggregateType = "Product";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      sellerId: Seller;
      category: Category;
      name: string;
      productImageUrl: string;
      description: string;
      originalPrice: number;
      discountedPrice: number;
      discountRate: number;
      availableStock: number;
      expirationDate: Date;
      createdAt: Date;
      updatedAt: Date;
    },
    public readonly version: number,
  ) {}
}
