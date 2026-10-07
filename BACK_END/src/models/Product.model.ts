import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  brandId?: Types.ObjectId | null;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  basePrice: number;
  salePrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
      index: true,
    },
    name: { type: String, required: true, maxlength: 255 },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: null },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    minPrice: { type: Number, default: null, min: 0 },
    maxPrice: { type: Number, default: null, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5, precision: 2 },
    totalReviews: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    metaTitle: { type: String, default: null, maxlength: 255 },
    metaDescription: { type: String, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

productSchema.plugin(toJSON);

productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ basePrice: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  productSchema
);
export default Product;