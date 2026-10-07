import mongoose, { Schema, Document, Model } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, maxlength: 150 },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: null },
    logo: { type: String, default: null, maxlength: 500 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

brandSchema.plugin(toJSON);

brandSchema.index({ name: "text" });

export const Brand: Model<IBrand> = mongoose.model<IBrand>("Brand", brandSchema);
export default Brand;