import { model, Schema } from "dynamoose";

// OrderItemsView 스키마 정의
export const OrderItemsViewSchema = new Schema(
    {
        id: {
            type: String,
            hashKey: true, // 기본 키 설정
            required: true,
        },
        orderId: {
            type: String,
            required: true, // 연관된 주문 ID
        },
        productId: {
            type: Number,
            required: true, // 제품 ID
        },
        quantity: {
            type: Number,
            required: true, // 수량
        },
        price: {
            type: Number,
            required: true, // 가격
        },
    },
    {
        saveUnknown: false, // 알 수 없는 속성 저장 방지
        timestamps: true, // createdAt 및 updatedAt 자동 관리
    }
);

// OrderItemsView 모델 정의
export const OrderItemsViewModel = model("OrderItemsView", OrderItemsViewSchema); // 모델 이름 변경