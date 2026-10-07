import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IVariantAttribute extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  attributeId: Types.ObjectId;
  attributeValueId: Types.ObjectId;
}

const variantAttributeSchema = new Schema<IVariantAttribute>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      index: true,
    },
    attributeId: {
      type: Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
      index: true,
    },
    attributeValueId: {
      type: Schema.Types.ObjectId,
      ref: "AttributeValue",
      required: true,
      index: true,
    },
  },
  { timestamps: false, versionKey: false }
);

variantAttributeSchema.plugin(toJSON);

variantAttributeSchema.index(
  { variantId: 1, attributeId: 1 },
  { unique: true }
);

export const VariantAttribute: Model<IVariantAttribute> =
  mongoose.model<IVariantAttribute>(
    "VariantAttribute",
    variantAttributeSchema
  );
export default VariantAttribute;