import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class SellerView extends Document {
  @Prop({ required: true, unique: true })
  sellerId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  storeName: string;

  @Prop({ required: true })
  storeAddress: string;

  @Prop({ required: true })
  storePhoneNumber: string;

  @Prop({ required: true, default: false })
  isBusinessNumberVerified: boolean;

  @Prop({ required: true, default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const SellerViewSchema = SchemaFactory.createForClass(SellerView);
