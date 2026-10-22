// =====================================================
// FILE: Conversation.model.ts
// MÔ TẢ: Hội thoại chat giữa customer và shop (admin).
//        1 customer có thể có NHIỀU conversation theo thời gian
//        (VD: mỗi đơn hàng 1 conversation, hoặc chat theo chủ đề).
// BẢNG DBML: 24. conversations
// QUAN HỆ: customerId → User, assignedAdminId → User
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type ConversationStatus = "open" | "pending" | "closed";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  assignedAdminId?: Types.ObjectId | null;
  subject?: string | null;
  status: ConversationStatus;
  lastMessageAt?: Date | null;
  lastMessagePreview?: string | null;
  customerUnreadCount: number;
  adminUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subject: { type: String, default: null, maxlength: 255 },
    status: {
      type: String,
      enum: ["open", "pending", "closed"],
      default: "open",
      // Không đặt index: true ở đây — đã có conversationSchema.index({ status: 1 }) bên dưới
    },
    lastMessageAt: { type: Date, default: null },
    lastMessagePreview: { type: String, default: null, maxlength: 255 },
    customerUnreadCount: { type: Number, default: 0, min: 0 },
    adminUnreadCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

conversationSchema.plugin(toJSON);

// List hội thoại của customer, sort mới nhất
conversationSchema.index({ customerId: 1, lastMessageAt: -1 });
conversationSchema.index({ customerId: 1, status: 1 });
// List hội thoại admin phụ trách
conversationSchema.index({ assignedAdminId: 1, status: 1 });
conversationSchema.index({ assignedAdminId: 1, lastMessageAt: -1 });
// Lọc theo trạng thái
conversationSchema.index({ status: 1 });
// Sort toàn bộ hội thoại mới nhất (trang admin)
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation: Model<IConversation> =
  mongoose.model<IConversation>("Conversation", conversationSchema);
export default Conversation;

// =====================================================
// KẾT THÚC FILE: Conversation.model.ts
// GHI CHÚ:
// - customerId KHÔNG unique → cho phép nhiều conversation / customer.
// - assignedAdminId = null → chưa có admin phụ trách.
// - lastMessageAt + lastMessagePreview: denormalized để render list chat
//   không cần JOIN bảng messages.
// - customerUnreadCount / adminUnreadCount: denormalized, cập nhật trong
//   transaction khi gửi tin (xem Message.model.ts).
// - Khi mở conversation: reset count tương ứng về 0 + mark messages.isRead = true.
// - Index status chỉ khai báo 1 lần qua schema.index() → tránh warning
//   "Duplicate schema index" của Mongoose.
// =====================================================