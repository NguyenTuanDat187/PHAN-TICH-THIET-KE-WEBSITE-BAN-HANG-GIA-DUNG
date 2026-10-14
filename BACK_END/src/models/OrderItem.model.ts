import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IOrderItem extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId | null;

  productName: string;
  productSku?: string | null;
  variantSku?: string | null;
  variantAttributes?: string | null;

  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;

  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
      index: true,
    },

    productName: { type: String, required: true, maxlength: 255 },
    productSku: { type: String, default: null },
    variantSku: { type: String, default: null },
    variantAttributes: { type: String, default: null },

    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

orderItemSchema.plugin(toJSON);

export const OrderItem: Model<IOrderItem> = mongoose.model<IOrderItem>(
  "OrderItem",
  orderItemSchema
);
export default OrderItem;