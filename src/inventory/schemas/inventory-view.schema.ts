import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class InventoryView extends Document {
  @Prop({ required: true })
  inventoryId: number; 

  @Prop({ required: true })
  productId: number;  

  @Prop({ required: true })
  quantity: number;  

  @Prop({ required: true })
  expirationDate: Date; 

  @Prop({ required: true })
  createdAt: Date;  

  @Prop({ required: true })
  updatedAt: Date;  
}

export const InventoryViewSchema = SchemaFactory.createForClass(InventoryView);
