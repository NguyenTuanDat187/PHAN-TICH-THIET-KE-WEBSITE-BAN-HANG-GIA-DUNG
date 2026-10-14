//`BACK_END/src/models/UserAddress.model.ts`

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

/**
 * -------------------------------------------------------
 * INTERFACE: USER ADDRESS
 * Mô tả cấu trúc dữ liệu địa chỉ giao hàng của người dùng.
 * -------------------------------------------------------
 */
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

/**
 * -------------------------------------------------------
 * SCHEMA: USER ADDRESS
 * Khai báo cấu trúc và các ràng buộc dữ liệu.
 * -------------------------------------------------------
 */
const userAddressSchema = new Schema<IUserAddress>(
  {
    // ID người dùng sở hữu địa chỉ.
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID người dùng là bắt buộc."],
    },

    // Tên người nhận hàng.
    recipientName: {
      type: String,
      required: [true, "Tên người nhận là bắt buộc."],
      trim: true,
      maxlength: [150, "Tên người nhận không được vượt quá 150 ký tự."],
    },

    // Số điện thoại người nhận.
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc."],
      trim: true,
      maxlength: [20, "Số điện thoại không được vượt quá 20 ký tự."],
    },

    // Địa chỉ chi tiết: số nhà, tên đường...
    addressLine: {
      type: String,
      required: [true, "Địa chỉ chi tiết là bắt buộc."],
      trim: true,
      maxlength: [255, "Địa chỉ chi tiết không được vượt quá 255 ký tự."],
    },

    // Phường/xã.
    ward: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Phường/xã không được vượt quá 100 ký tự."],
    },

    // Quận/huyện.
    district: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Quận/huyện không được vượt quá 100 ký tự."],
    },

    // Tỉnh/thành phố.
    province: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Tỉnh/thành phố không được vượt quá 100 ký tự."],
    },

    // Đánh dấu địa chỉ mặc định của người dùng.
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * -------------------------------------------------------
 * PLUGIN: TO JSON
 * Chuẩn hóa dữ liệu khi chuyển document sang JSON.
 * -------------------------------------------------------
 */
userAddressSchema.plugin(toJSON);

/**
 * -------------------------------------------------------
 * INDEX 1: TRA CỨU ĐỊA CHỈ
 * Hỗ trợ truy vấn địa chỉ theo userId và isDefault.
 * -------------------------------------------------------
 */
userAddressSchema.index(
  { userId: 1, isDefault: 1 },
  { name: "user_address_lookup_index" }
);

/**
 * -------------------------------------------------------
 * INDEX 2: DUY NHẤT ĐỊA CHỈ MẶC ĐỊNH
 *
 * Mỗi người dùng chỉ được có tối đa một địa chỉ
 * có isDefault = true.
 *
 * Các địa chỉ có isDefault = false không bị giới hạn.
 * -------------------------------------------------------
 */
userAddressSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
    },
    name: "unique_default_address_per_user",
  }
);

/**
 * -------------------------------------------------------
 * MODEL: USER ADDRESS
 * -------------------------------------------------------
 */
export const UserAddress: Model<IUserAddress> =
  mongoose.models.UserAddress ||
  mongoose.model<IUserAddress>("UserAddress", userAddressSchema);

export default UserAddress;

