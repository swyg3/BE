import { Schema } from "dynamoose";

export const SellerSchema = new Schema(
  {
    sellerId: {
      type: String,
      hashKey: true, // 파티션 키로 설정 (고유 식별자)
    },
    email: {
      type: String,
      required: true,
      index: {
        name: "EmailIndex", // 인덱스 이름
        type: "global", // 글로벌 보조 인덱스로 설정
        rangeKey: "createdAt", // 선택적 정렬 키 설정
        project: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeAddress: {
      type: String,
      required: true,
    },
    storePhoneNumber: {
      type: String,
      required: true,
    },
    isBusinessNumberVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    agreeReceiveLocation: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    saveUnknown: false,
  },
);
