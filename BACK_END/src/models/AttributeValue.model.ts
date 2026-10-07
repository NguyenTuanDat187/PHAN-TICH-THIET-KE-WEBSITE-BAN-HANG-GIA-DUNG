import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IAttributeValue extends Document {
  _id: Types.ObjectId;
  attributeId: Types.ObjectId;
  value: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const attributeValueSchema = new Schema<IAttributeValue>(
  {
    attributeId: {
      type: Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
      index: true,
    },
    value: { type: String, required: true, maxlength: 100 },
    slug: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

attributeValueSchema.plugin(toJSON);

attributeValueSchema.index({ attributeId: 1, value: 1 }, { unique: true });

export const AttributeValue: Model<IAttributeValue> =
  mongoose.model<IAttributeValue>("AttributeValue", attributeValueSchema);
export default AttributeValue;