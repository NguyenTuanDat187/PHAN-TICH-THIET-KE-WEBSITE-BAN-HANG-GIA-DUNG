
/**
 * =========================================================
 * FILE: BACK_END/src/models/AIConversation.model.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Lưu các cuộc trò chuyện với AI.
 * - Lưu lịch sử tin nhắn của khách hàng.
 * - Hỗ trợ khách vãng lai thông qua sessionId.
 * - Hỗ trợ khách đăng nhập thông qua userId.
 */

import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export type AIMessageRole = "user" | "assistant";

export interface IAIMessage {
  role: AIMessageRole;
  content: string;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  userId?: Types.ObjectId | null;
  sessionId?: string | null;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const AIConversationSchema =
  new Schema<IAIConversation>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      sessionId: {
        type: String,
        default: null,
        trim: true,
      },

      title: {
        type: String,
        required: true,
        default: "Cuộc trò chuyện mới",
        trim: true,
        maxlength: 120,
      },

      messages: {
        type: [AIMessageSchema],
        default: [],
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

// Tối ưu truy vấn lịch sử theo tài khoản.
AIConversationSchema.index({
  userId: 1,
  updatedAt: -1,
});

// Tối ưu truy vấn hội thoại của khách vãng lai.
AIConversationSchema.index({
  sessionId: 1,
  updatedAt: -1,
});

export const AIConversation =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversation>(
    "AIConversation",
    AIConversationSchema,
  );

export default AIConversation;
