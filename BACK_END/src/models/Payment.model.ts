import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type PaymentMethod = "COD" | "BANK" | "MOMO" | "VNPAY" | "ZALOPAY";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  paymentMethod: PaymentMethod;
  transactionCode?: string | null;
  amount: number;
  status: PaymentStatus;
  gatewayResponse?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK", "MOMO", "VNPAY", "ZALOPAY"],
      required: true,
    },
    transactionCode: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    gatewayResponse: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.plugin(toJSON);

paymentSchema.index({ paymentMethod: 1, status: 1 });

export const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);
export default Payment;