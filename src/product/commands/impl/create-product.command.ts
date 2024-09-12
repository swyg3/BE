import { Category } from "src/product/product.category";

export class CreateProductCommand {
  constructor(
    public readonly sellerId: number,
    public readonly category: Category,
    public readonly name: string,
    public readonly productImageUrl: string,
    public readonly description: string,
    public readonly originalPrice: number,
    public readonly discountedPrice: number,
    public readonly quantity: number,
    public readonly expirationDate: Date,
  ) {}
}
