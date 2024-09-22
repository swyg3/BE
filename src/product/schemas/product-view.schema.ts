import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Transform } from "class-transformer";
import { Document } from "mongoose";
import { Category } from "src/product/product.category";
import { Seller } from "src/sellers/entities/seller.entity";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { join } from "path";

@Schema()
export class ProductView extends Document {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true })
  sellerId: Seller; // Seller를 참조하는 외래 키

  @Prop({ required: true, enum: Category })
  category: Category;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  @Transform(
    ({ value }) => value && `/${join(PRODUCTS_PUBLIC_IMAGE_PATH, value)}`,
  )
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
