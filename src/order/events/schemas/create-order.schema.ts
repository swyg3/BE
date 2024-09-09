import { Schema } from 'mongoose';

export const CreateOrderSchema = new Schema({
    userId: { type: Number, required: true },
    sellerId: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    pickupTime: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true },
    // JSON 형태의 데이터 저장
    items: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export interface OrderCreate extends Document {
    readonly userId: number;
    readonly sellerId: number;
    readonly totalAmount: number;
    readonly pickupTime: Date;
    readonly paymentMethod: string;
    readonly status: string;
    readonly items: any;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}