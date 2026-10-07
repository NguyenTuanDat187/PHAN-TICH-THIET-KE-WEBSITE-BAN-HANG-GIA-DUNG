import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IProductReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId | null;

  rating: number;
  title?: string | null;
  content?: string | null;
  images?: string | null;

  isVerifiedPurchase: boolean;
  isApproved: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productReviewSchema = new Schema<IProductReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
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
      default: null,
      index: true,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null, maxlength: 255 },
    content: { type: String, default: null },
    images: { type: String, default: null },

    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

productReviewSchema.plugin(toJSON);

productReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
productReviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });

export const ProductReview: Model<IProductReview> =
  mongoose.model<IProductReview>("ProductReview", productReviewSchema);
export default ProductReview;