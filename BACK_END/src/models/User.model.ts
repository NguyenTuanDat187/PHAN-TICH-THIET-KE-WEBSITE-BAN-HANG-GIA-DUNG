import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type UserRole = "customer" | "admin";
export type UserStatus = "active" | "inactive" | "blocked";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: null, trim: true, maxlength: 20 },
    avatar: { type: String, default: null, maxlength: 500 },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      index: true,
    },
    emailVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

userSchema.plugin(toJSON);

userSchema.index({ role: 1, status: 1 });

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;