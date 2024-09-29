import { Category } from "src/product/product.category";
import { Seller } from "src/sellers/entities/seller.entity";

export class CreateProductCommand {
  constructor(
    public readonly sellerId: string,
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
