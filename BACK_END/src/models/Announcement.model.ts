// =====================================================
// FILE: Announcement.model.ts
// MÔ TẢ: Model thông báo broadcast do admin tạo cho TẤT CẢ khách hàng.
//        Hỗ trợ nháp (publishedAt = null) → publish (set publishedAt).
//        Có thể hẹn giờ hiển thị qua startsAt / expiresAt.
// BẢNG DBML: 20. announcements
// QUAN HỆ: createdBy → User
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type AnnouncementType =
  | "promotion"
  | "policy"
  | "maintenance"
  | "general"
  | "system"
  | "new_arrival";

export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  content: string;
  actionUrl?: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  publishedAt?: Date | null;
  isActive: boolean;
  totalRecipients: number;
  totalRead: number;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    content: { type: String, required: true },
    actionUrl: { type: String, default: null, maxlength: 500 },
    type: {
      type: String,
      enum: [
        "promotion",
        "policy",
        "maintenance",
        "general",
        "system",
        "new_arrival",
      ],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    totalRecipients: { type: Number, default: 0, min: 0 },
    totalRead: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

announcementSchema.plugin(toJSON);

// Query broadcast còn hiệu lực: đã publish + active + trong khoảng thời gian
announcementSchema.index({ isActive: 1, publishedAt: 1 });
announcementSchema.index({ isActive: 1, priority: 1 });
announcementSchema.index({ type: 1, isActive: 1, startsAt: 1 });
announcementSchema.index({ startsAt: 1, expiresAt: 1 });

export const Announcement: Model<IAnnouncement> =
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);
export default Announcement;

// =====================================================
// KẾT THÚC FILE: Announcement.model.ts
// GHI CHÚ:
// - publishedAt = null  → bản nháp, chưa hiển thị cho user.
// - publishedAt có giá trị → đã publish; kết hợp startsAt/expiresAt để lọc hiển thị.
// - totalRecipients = snapshot số customer active tại thời điểm publish.
// - totalRead = denormalized, tăng khi user đọc (xem AnnouncementRead.model.ts).
// =====================================================