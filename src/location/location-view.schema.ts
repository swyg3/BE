import { model, Schema } from "dynamoose";
import { LocationType } from "./location.type";

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
    locationType: {
      type: String,
      enum: Object.values(LocationType),
      default: LocationType.SEARCH,
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
