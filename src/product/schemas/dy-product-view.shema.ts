import { Schema } from "dynamoose";
import { Category } from "src/product/product.category";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { join } from "path";

export const ProductSchema = new Schema(
  {
    productId: {
      type: String,
      hashKey: true,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
      index: {
        name: "SellerIdIndex",
        type: "global",
      },
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(Category),
      index: {
        name: "CategoryIndex",
        type: "global",
      },
    },
    name: {
      type: String,
      required: true,
    },
    productImageUrl: {
      type: String,
      required: true,
      set: (value: string) =>
        value && `/${join(PRODUCTS_PUBLIC_IMAGE_PATH, value)}`,
    },
    description: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    discountRate: {
      type: Number,
      index: {
        name: "DiscountRateIndex",
        type: "global",
        rangeKey: "productId",
      },
    },
    availableStock: {
      type: Number,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt", // 자동 생성 시간 설정
      updatedAt: "updatedAt", // 자동 수정 시간 설정
    },
    saveUnknown: false, // 스키마에 정의되지 않은 속성의 저장을 방지
  },
);
