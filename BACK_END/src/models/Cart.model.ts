import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true, versionKey: false }
);

cartSchema.plugin(toJSON);

cartSchema.index(
  { userId: 1, productId: 1, variantId: 1 },
  { unique: true }
);

export const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;