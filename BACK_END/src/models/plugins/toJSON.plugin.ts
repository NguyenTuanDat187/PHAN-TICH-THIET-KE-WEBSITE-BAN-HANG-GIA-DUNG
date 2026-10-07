import { Schema } from "mongoose";

/**
 * Plugin: chuyển _id -> id, xóa __v, giữ nguyên timestamps
 * tự động cấu hình cách serialize (chuyển document → JSON/Object) cho mọi model được gắn plugin.
 */
export const toJSON = (schema: Schema) => {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password; // không bao giờ trả password
      return ret;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
};