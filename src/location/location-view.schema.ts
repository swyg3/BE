import { model, Schema } from "dynamoose";

export const UserLocationSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    GSI_KEY: {
      type: String,
      default: "USER_LOCATION",
      index: {
        name: "GSI_KEY_Index",
        type: "global",
        rangeKey: "updatedAt"
      }
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: "UserIdIndex",
        type: "global",
      },
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: {
      updatedAt: "updatedAt",
    },
    saveUnknown: false,
  }
);

export const UserLocation = model("UserLocation", UserLocationSchema, {
  create: false,
  update: true,
  waitForActive: true,
});