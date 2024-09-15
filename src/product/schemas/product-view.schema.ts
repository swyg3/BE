import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "src/product/product.category";
import { Seller } from "src/sellers/entities/seller.entity";

@Schema()
export class ProductView extends Document {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true })
  sellerId: Seller;

  @Prop({ required: true, enum: Category })
  category: Category;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  productImageUrl: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  originalPrice: number;

  @Prop({ required: true })
  discountedPrice: number;

  @Prop({ required: true })
  discountRate: number;

  @Prop({ required: true })
  availableStock: number;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const ProductViewSchema = SchemaFactory.createForClass(ProductView);
