import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CreateOrderSchema extends Document {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    userId: number;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true })
    totalPrice: number;

    @Prop({ required: true })
    paymentMethod: string;

    @Prop({ required: true })
    status: string;

    @Prop({ type: [{ orderId: String, productId: Number, quantity: Number, price: Number }] })
    items: { orderId: string; productId: number; quantity: number; price: number }[];

    @Prop({ required: true })
    pickupTime: Date;

    @Prop({ required: true })
    createdAt: Date;
}

export const CreateOrderEventSchema = SchemaFactory.createForClass(CreateOrderSchema);