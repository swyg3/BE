import { model, Schema } from "dynamoose";
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
    GSI_KEY: {
      type: String,
      default: "PRODUCT",  // 모든 제품에 대해 동일한 값
      index: {
        name: "DiscountRateIndex",
        type: "global",
        rangeKey: "discountRate"  // GSI의 정렬 키로 discountRate 사용
      }
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
      required: true,  // discountRate를 필수 필드로 변경
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
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    saveUnknown: false,
  }
);

export const Product = model("Product", ProductSchema, {
  create: false,
  update: true,
  waitForActive: false,
});