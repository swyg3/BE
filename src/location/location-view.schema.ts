import { model, Schema } from "dynamoose";

export const UserLocationSchema = new Schema(
  {
    locationId: {
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
        rangeKey: "updatedAt",
      },
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: "UserIdIndex",
        type: "global",
      },
    },
    searchTerm: {
      type: String,
      required: true,
    },
    roadAddress: {
      type: String,
      required: true,
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
    isAgreed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      updatedAt: "updatedAt",
    },
    saveUnknown: false,
  }
);

export const UserLocation = model("UserLocation", UserLocationSchema, {
  create: true,
  update: true,
  waitForActive: true,
});