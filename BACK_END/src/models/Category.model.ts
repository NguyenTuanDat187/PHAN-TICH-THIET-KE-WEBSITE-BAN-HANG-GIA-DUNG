import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
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
    image: { type: String, default: null, maxlength: 500 },
    metaTitle: { type: String, default: null, maxlength: 255 },
    metaDescription: { type: String, default: null },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.plugin(toJSON);

categorySchema.index({ name: "text", description: "text" });

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  categorySchema
);
export default Category;