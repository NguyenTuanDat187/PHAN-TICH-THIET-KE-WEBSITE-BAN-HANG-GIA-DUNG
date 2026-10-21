// =====================================================
// FILE: AnnouncementRead.model.ts
// MÔ TẢ: Ghi nhận ai đã đọc broadcast nào.
//        CHỈ insert khi user thực sự đọc → tiết kiệm dung lượng.
//        Bản ghi bất biến: insert 1 lần, không update.
// BẢNG DBML: 22. announcement_reads
// QUAN HỆ: announcementId → Announcement, userId → User
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IAnnouncementRead extends Document {
  _id: Types.ObjectId;
  announcementId: Types.ObjectId;
  userId: Types.ObjectId;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementReadSchema = new Schema<IAnnouncementRead>(
  {
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    readAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

announcementReadSchema.plugin(toJSON);

// 1 user chỉ đọc 1 announcement 1 lần → unique
announcementReadSchema.index(
  { announcementId: 1, userId: 1 },
  { unique: true }
);
// Query "lịch sử đọc của user, sort mới nhất"
announcementReadSchema.index({ userId: 1, readAt: -1 });

export const AnnouncementRead: Model<IAnnouncementRead> =
  mongoose.model<IAnnouncementRead>(
    "AnnouncementRead",
    announcementReadSchema
  );
export default AnnouncementRead;

// =====================================================
// KẾT THÚC FILE: AnnouncementRead.model.ts
// GHI CHÚ:
// - Khi user đọc broadcast: dùng upsert với $setOnInsert để idempotent.
//   Nếu upsertedCount === 1 (thực sự insert mới) → tăng Announcement.totalRead lên 1.
// - Unique index (announcementId, userId) đảm bảo không đọc trùng.
// - readAt dùng để hiển thị "đã đọc lúc nào" và sort lịch sử.
// =====================================================