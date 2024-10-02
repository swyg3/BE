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
      default: "PRODUCT",
      index: [
        {
          name: "DiscountRateIndex",
          type: "global",
          rangeKey: "discountRate"
        },
        {
          name: "DistanceIndex",
          type: "global",
          rangeKey: "distance"
        },
        {
          name: "DistanceDiscountIndex",
          type: "global",
          rangeKey: "distanceDiscountScore"
        },
        {
          name: "ProductNameIndex",
          type: "global",
          rangeKey: "name"
        }
      ]
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
      index: [
        {
          name: "CategoryDiscountRateIndex",
          type: "global",
          rangeKey: "discountRate"
        },
        {
          name: "CategoryDistanceIndex",
          type: "global",
          rangeKey: "distance"
        },
        {
          name: "CategoryDistanceDiscountIndex",
          type: "global",
          rangeKey: "distanceDiscountScore"
        }
      ]
    },
    name: {
      type: String,
      required: true,
      index: [
        {
          name: "NameDiscountRateIndex",
          type: "global",
          rangeKey: "discountRate",
        },
        {
          name: "NameDistanceIndex",
          type: "global",
          rangeKey: "distance",
        },
        {
          name: "NameDistanceDiscountIndex",
          type: "global",
          rangeKey: "distanceDiscountScore",
        },
      ],
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
      required: true,
    },
    availableStock: {
      type: Number,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    locationX: {
      type: String,
      required: true,
    },
    locationY: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: false,
      default: 0,
      index: {
        name: "DistanceIndex",
        type: "global",
      }
    },
    distanceDiscountScore: {
      type: Number,
      required: false,
      default: 0,
      index: {
        name: "DistanceDiscountIndex",
        type: "global",
      }
    }
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
  waitForActive: true,
});