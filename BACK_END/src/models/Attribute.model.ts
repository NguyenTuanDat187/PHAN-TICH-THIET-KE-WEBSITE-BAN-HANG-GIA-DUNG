import mongoose, { Schema, Document, Model } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IAttribute extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const attributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

attributeSchema.plugin(toJSON);

export const Attribute: Model<IAttribute> = mongoose.model<IAttribute>(
  "Attribute",
  attributeSchema
);
export default Attribute;