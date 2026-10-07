import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export interface IUserAddress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userAddressSchema = new Schema<IUserAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientName: { type: String, required: true, maxlength: 150 },
    phone: { type: String, required: true, maxlength: 20 },
    addressLine: { type: String, required: true },
    ward: { type: String, default: null, maxlength: 100 },
    district: { type: String, default: null, maxlength: 100 },
    province: { type: String, default: null, maxlength: 100 },
    isDefault: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

userAddressSchema.plugin(toJSON);

userAddressSchema.index({ userId: 1, isDefault: 1 });

export const UserAddress: Model<IUserAddress> = mongoose.model<IUserAddress>(
  "UserAddress",
  userAddressSchema
);
export default UserAddress;