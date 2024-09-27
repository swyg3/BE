import { model, Schema } from "dynamoose";

// OrderView 스키마 정의
export const OrderViewSchema = new Schema(
    {
        id: {
            type: String,
            hashKey: true, // 기본 키 설정
            required: true,
        },
        userId: {
            type: Number,
            required: true,
            index: { // 글로벌 보조 인덱스 설정
                name: "UserIdIndex",
                type: "global",
            },
        },
        sellerId: {
            type: Number,
            required: true,
            index: { // 글로벌 보조 인덱스 설정
                name: "SellerIdIndex",
                type: "global",
            },
        },
        status: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        pickupTime: {
            type: Date,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt', // createdAt 필드 관리
            updatedAt: 'updatedAt', // updatedAt 필드 관리
        },
        saveUnknown: false, // 알 수 없는 속성 저장 방지
    }
);

// OrderView 모델 정의
export const OrderViewModel = model("OrderView", OrderViewSchema);