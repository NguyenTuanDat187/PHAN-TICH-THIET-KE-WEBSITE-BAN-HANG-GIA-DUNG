// =====================================================
// FILE: Message.model.ts
// MÔ TẢ: Tin nhắn trong 1 hội thoại chat.
//        Hỗ trợ text / image / file / system message.
// BẢNG DBML: 25. messages
// QUAN HỆ: conversationId → Conversation, senderId → User
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type MessageType = "text" | "image" | "file" | "system";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId; // customer hoặc admin
  messageType: MessageType;
  content?: string | null; // text hoặc URL file
  attachments?: string[] | null; // JSON array URL file nếu nhiều file
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Không đặt index: true ở đây — đã có messageSchema.index({ senderId: 1 }) bên dưới
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    content: { type: String, default: null },
    attachments: {
      type: [String],
      default: null,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

messageSchema.plugin(toJSON);

// Load tin nhắn theo thứ tự thời gian
messageSchema.index({ conversationId: 1, createdAt: 1 });
// Cursor pagination (ổn định hơn createdAt khi insert nhanh)
messageSchema.index({ conversationId: 1, _id: -1 });
// Đếm unread per conversation
messageSchema.index({ conversationId: 1, isRead: 1 });
// Query tin nhắn theo người gửi
messageSchema.index({ senderId: 1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  messageSchema
);
export default Message;

// =====================================================
// KẾT THÚC FILE: Message.model.ts
// GHI CHÚ:
// - senderId có thể là customerId của conversation HOẶC bất kỳ admin nào.
//   App cần validate: sender phải là customer của conversation, hoặc role='admin'.
// - attachments dùng [String] native (không cần parse JSON thủ công).
// - Khi gửi tin: insert Message + update Conversation (lastMessageAt,
//   lastMessagePreview, tăng unread_count tương ứng) trong 1 transaction.
// - Khi mở conversation: update isRead=true, readAt=now cho các message chưa đọc.
// - Cursor pagination nên dùng _id thay vì createdAt để tránh trùng giây.
// - Index senderId chỉ khai báo 1 lần qua schema.index() → tránh warning
//   "Duplicate schema index" của Mongoose.
// =====================================================