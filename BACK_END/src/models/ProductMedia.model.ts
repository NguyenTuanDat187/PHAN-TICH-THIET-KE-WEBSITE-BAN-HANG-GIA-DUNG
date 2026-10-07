import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type MediaType = "image" | "video";

export interface IProductMedia extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  mediaType: MediaType;
  mediaUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

const productMediaSchema = new Schema<IProductMedia>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    mediaUrl: { type: String, required: true, maxlength: 500 },
    altText: { type: String, default: null, maxlength: 255 },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

productMediaSchema.plugin(toJSON);

productMediaSchema.index({ productId: 1, sortOrder: 1 });
productMediaSchema.index({ productId: 1, isPrimary: 1 });

export const ProductMedia: Model<IProductMedia> =
  mongoose.model<IProductMedia>("ProductMedia", productMediaSchema);
export default ProductMedia;