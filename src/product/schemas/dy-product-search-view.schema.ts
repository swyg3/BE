import * as dynamoose from 'dynamoose';
import { Schema } from 'dynamoose/dist/index';
import { Item } from 'dynamoose/dist/Item';
import { Category } from "src/product/product.category";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { join } from "path";
import { Model } from 'nestjs-dynamoose';

export interface DySearchProductView extends Item {
  productId: string;
  name: string;
  discountRate: number;
  discountedPrice: number;
  originalPrice: number;  
  description: string;
  expirationDate: Date;  
  category: Category;
  productImageUrl: string;
  sellerId: string;
}


export const DySearchProductViewSchema = new Schema({
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
    set: (value: string) => value && `/${join(PRODUCTS_PUBLIC_IMAGE_PATH, value)}`,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
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
  expireDate: {
    type: Date,
    required: true,
  },
  
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  saveUnknown: false,
});

export const DySearchProductViewModel = dynamoose.model<DySearchProductView>('DySearchProductView', DySearchProductViewSchema);
