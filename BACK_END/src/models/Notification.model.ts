// =====================================================
// FILE: Notification.model.ts
// MÔ TẢ: Thông báo transactional — sinh ra từ sự kiện phát sinh.
//        1 sự kiện → 1..N dòng (mỗi người nhận 1 dòng).
//        Ví dụ: khách đặt đơn → báo admin; admin xác nhận → báo khách.
// BẢNG DBML: 23. notifications
// QUAN HỆ: userId → User (người nhận), senderId → User (người gửi, null = system)
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type NotificationType =
  | "order"
  | "payment"
  | "review"
  | "chat"
  | "account"
  | "stock"
  | "promotion";

export type NotificationReferenceType =
  | "order"
  | "product"
  | "review"
  | "conversation"
  | "coupon"
  | "account";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // người nhận
  senderId?: Types.ObjectId | null; // người gửi (null = system)
  type: NotificationType;
  title: string;
  content?: string | null;
  referenceType?: NotificationReferenceType | null;
  referenceId?: Types.ObjectId | null;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "review",
        "chat",
        "account",
        "stock",
        "promotion",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    content: { type: String, default: null },
    referenceType: {
      type: String,
      enum: ["order", "product", "review", "conversation", "coupon", "account"],
      default: null,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    actionUrl: { type: String, default: null, maxlength: 500 },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.plugin(toJSON);

// Badge chưa đọc của user (query phổ biến nhất)
notificationSchema.index({ userId: 1, isRead: 1 });
// List thông báo của user, sort mới nhất
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// Filter theo type
notificationSchema.index({ userId: 1, type: 1 });
// Query ngược "thông báo của đơn #123 / review #67..."
notificationSchema.index({ referenceType: 1, referenceId: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;

// =====================================================
// KẾT THÚC FILE: Notification.model.ts
// GHI CHÚ:
// - Mỗi notification chỉ gắn 1 reference chính (referenceType + referenceId).
// - senderId = null → thông báo do hệ thống tự sinh.
// - Khi user đọc: update isRead=true, readAt=now.
// - Badge tổng = COUNT(isRead=false) + broadcast chưa đọc + chat unread.
// - referenceType là polymorphic → không khai báo ref cứng cho referenceId.
// =====================================================