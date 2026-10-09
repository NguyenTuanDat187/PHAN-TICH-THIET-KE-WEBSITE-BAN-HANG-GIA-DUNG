import mongoose, { Schema, Document, Model } from "mongoose";
import { toJSON } from "./plugins/toJSON.plugin";

export type OtpType = "register" | "forgot_password" | "verify_email";

export interface IOtpCode extends Document {
  email: string;
  otpCode: string;
  type: OtpType;
  expiresAt: Date;
  verifiedAt?: Date | null;
  attempts: number;
  createdAt: Date;
}

const otpCodeSchema = new Schema<IOtpCode>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otpCode: { type: String, required: true, maxlength: 10 },
    type: {
      type: String,
      enum: ["register", "forgot_password", "verify_email"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

otpCodeSchema.plugin(toJSON);

otpCodeSchema.index({ email: 1, type: 1 });

// TTL: tự xóa khi hết hạn
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpCode: Model<IOtpCode> = mongoose.model<IOtpCode>(
  "OtpCode",
  otpCodeSchema
);
export default OtpCode;