import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface ICouponUsage extends Document {
  _id: Types.ObjectId;
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  discountAmount: number;
  usedAt?: Date | null;
}

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    discountAmount: { type: Number, required: true, min: 0 },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

couponUsageSchema.plugin(toJSON);

couponUsageSchema.index({ couponId: 1, userId: 1 });

export const CouponUsage: Model<ICouponUsage> =
  mongoose.model<ICouponUsage>("CouponUsage", couponUsageSchema);
export default CouponUsage;