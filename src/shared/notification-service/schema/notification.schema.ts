import { Schema } from "dynamoose";

export const NotificationSchema = new Schema(
  {
    messageId: {
      type: String,
      hashKey: true,
    },
    userId: {
        type: String,
        required: true,
        index: {
            name: 'userIndex', 
            type: 'global',
            rangeKey: 'createdAt',
            project: true, 
        },
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    saveUnknown: false,
  }
);
