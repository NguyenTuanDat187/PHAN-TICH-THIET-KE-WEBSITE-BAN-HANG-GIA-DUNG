import mongoose, { Schema, Document, Model } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type DiscountType = "percentage" | "fixed";

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 150 },
    description: { type: String, default: null },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    maximumDiscountAmount: { type: Number, default: null, min: 0 },
    usageLimit: { type: Number, default: null, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: null, min: 0 },
    startsAt: { type: Date, default: null, index: true },
    expiresAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

couponSchema.plugin(toJSON);

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>(
  "Coupon",
  couponSchema
);
export default Coupon;