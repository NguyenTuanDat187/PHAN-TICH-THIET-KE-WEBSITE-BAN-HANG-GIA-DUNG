import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IProductVariant extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  weight?: number | null;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0, index: true },
    weight: { type: Number, default: null, min: 0 },
    image: { type: String, default: null, maxlength: 500 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

productVariantSchema.plugin(toJSON);

productVariantSchema.index({ productId: 1, isActive: 1 });

export const ProductVariant: Model<IProductVariant> =
  mongoose.model<IProductVariant>("ProductVariant", productVariantSchema);
export default ProductVariant;