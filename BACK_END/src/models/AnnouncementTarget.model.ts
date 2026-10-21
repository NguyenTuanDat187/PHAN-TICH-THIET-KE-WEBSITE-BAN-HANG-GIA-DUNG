// =====================================================
// FILE: AnnouncementTarget.model.ts
// MÔ TẢ: Đối tượng mà 1 broadcast nhắm tới (category / product / coupon).
//        1 announcement có 0..N target. KHÔNG có dòng nào = toàn shop (all).
// BẢNG DBML: 21. announcement_targets
// QUAN HỆ: announcementId → Announcement
// LƯU Ý: targetId là polymorphic reference (trỏ tới nhiều bảng khác nhau)
//        nên KHÔNG khai báo ref cứng trong Mongoose — validate ở tầng app.
// =====================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type AnnouncementTargetType = "category" | "product" | "coupon";

export interface IAnnouncementTarget extends Document {
  _id: Types.ObjectId;
  announcementId: Types.ObjectId;
  targetType: AnnouncementTargetType;
  targetId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementTargetSchema = new Schema<IAnnouncementTarget>(
  {
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["category", "product", "coupon"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

announcementTargetSchema.plugin(toJSON);

// 1 announcement không được gắn trùng cùng 1 target
announcementTargetSchema.index(
  { announcementId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);
// Query "broadcast liên quan tới SP / danh mục / coupon X"
announcementTargetSchema.index({ targetType: 1, targetId: 1 });
announcementTargetSchema.index({ announcementId: 1, targetType: 1 });

export const AnnouncementTarget: Model<IAnnouncementTarget> =
  mongoose.model<IAnnouncementTarget>(
    "AnnouncementTarget",
    announcementTargetSchema
  );
export default AnnouncementTarget;

// =====================================================
// KẾT THÚC FILE: AnnouncementTarget.model.ts
// GHI CHÚ:
// - Không insert dòng nào = broadcast áp dụng cho toàn bộ khách hàng.
// - targetType='category' + targetId=categoryId → broadcast áp cho mọi SP thuộc danh mục.
// - targetType='product'  + targetId=productId  → broadcast gắn 1 SP cụ thể.
// - targetType='coupon'   + targetId=couponId   → broadcast gắn chương trình giảm giá.
// - Unique index đảm bảo 1 announcement không gắn trùng 1 target.
// =====================================================