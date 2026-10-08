/**
 * =========================================================
 * FILE: BACK_END/src/controllers/otp.controller.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Quản lý OTP dùng chung cho Authentication.
 *
 * OTP được sử dụng cho:
 * 1. Đăng ký tài khoản
 * 2. Reset mật khẩu
 *
 * LUỒNG ĐĂNG KÝ:
 *
 * Email
 *   ↓
 * requestRegisterOtp / resendOtp
 *   ↓
 * generateOtp
 *   ↓
 * sendOtp (Có kiểm tra Cooldown chống spam)
 *   ↓
 * verifyRegisterOtp
 *   ↓
 * OTP đúng
 *   ↓
 * Cho phép hoàn tất đăng ký
 *
 * LUỒNG RESET PASSWORD:
 *
 * Email
 *   ↓
 * forgotPassword
 *   ↓
 * generateOtp
 *   ↓
 * sendOtp
 *   ↓
 * verifyResetPasswordOtp / resetPassword
 *   ↓
 * Reset password
 *
 * LƯU Ý:
 * - Không lưu OTP trực tiếp vào MongoDB.
 * - OTP được lưu tạm trong bộ nhớ server bằng Map.
 * - OTP hết hạn sau 5 phút.
 * - Cooldown giữa 2 lần gửi liên tiếp là 60 giây.
 * - Sai OTP tối đa 5 lần.
 * - Sau khi OTP được sử dụng thành công phải invalidate OTP.
 * =========================================================
 */

import { Request, Response } from "express";
import { sendOtpEmail } from "../config/mail";

/**
 * =========================================================
 * TYPE OTP
 * =========================================================
 *
 * register:
 *      OTP dùng để xác thực email đăng ký.
 *
 * reset_password:
 *      OTP dùng để reset mật khẩu.
 */
export type OTPType = "register" | "reset_password";

/**
 * =========================================================
 * INTERFACE OTP DATA
 * =========================================================
 */
interface OTPData {
  /**
   * Mã OTP 6 chữ số.
   */
  otp: string;

  /**
   * Thời gian OTP hết hạn (timestamp).
   */
  expiresAt: number;

  /**
   * Thời gian được phép gửi lại OTP tiếp theo (timestamp).
   */
  nextResendAt: number;

  /**
   * Số lần người dùng nhập OTP sai.
   */
  attempts: number;

  /**
   * OTP đang dùng cho chức năng nào.
   */
  type: OTPType;

  /**
   * Trạng thái email đã verify OTP hay chưa (dùng cho đăng ký).
   */
  verified: boolean;
}

/**
 * =========================================================
 * OTP CONFIG
 * =========================================================
 */

/**
 * OTP có hiệu lực trong 5 phút.
 */
const OTP_EXPIRES_IN = 5 * 60 * 1000;

/**
 * Khoảng thời gian phải chờ giữa 2 lần bấm gửi/gửi lại OTP (60 giây).
 */
const RESEND_COOLDOWN = 60 * 1000;

/**
 * Người dùng được nhập sai tối đa 5 lần.
 */
const MAX_OTP_ATTEMPTS = 5;

/**
 * =========================================================
 * OTP STORE
 * =========================================================
 */
const otpStore = new Map<string, OTPData>();

/**
 * =========================================================
 * HELPER: CHUẨN HÓA EMAIL
 * =========================================================
 */
const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * =========================================================
 * HELPER: TẠO OTP
 * =========================================================
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * =========================================================
 * HELPER: LƯU OTP
 * =========================================================
 */
export const createOtp = (
  email: string,
  type: OTPType,
): string => {
  const normalizedEmail = normalizeEmail(email);
  const otp = generateOtp();
  const now = Date.now();

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: now + OTP_EXPIRES_IN,
    nextResendAt: now + RESEND_COOLDOWN,
    attempts: 0,
    type,
    verified: false,
  });

  return otp;
};

/**
 * =========================================================
 * HELPER: LẤY OTP
 * =========================================================
 */
export const getOtp = (
  email: string,
): OTPData | undefined => {
  const normalizedEmail = normalizeEmail(email);
  return otpStore.get(normalizedEmail);
};

/**
 * =========================================================
 * HELPER: KIỂM TRA OTP CÒN HẠN
 * =========================================================
 */
const isOtpExpired = (otpData: OTPData): boolean => {
  return Date.now() > otpData.expiresAt;
};

/**
 * =========================================================
 * SERVICE: SEND OTP (CÓ COOLDOWN)
 * =========================================================
 */
export const sendOtp = async (
  email: string,
  type: OTPType,
): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
  const normalizedEmail = normalizeEmail(email);
  const existingOtp = otpStore.get(normalizedEmail);
  const now = Date.now();

  // Kiểm tra Cooldown chống spam gửi liên tục
  if (existingOtp && now < existingOtp.nextResendAt) {
    const retryAfterSec = Math.ceil((existingOtp.nextResendAt - now) / 1000);
    return {
      success: false,
      message: `Vui lòng đợi ${retryAfterSec} giây trước khi yêu cầu gửi lại OTP mới.`,
      retryAfter: retryAfterSec,
    };
  }

  // Tạo và ghi đè OTP mới
  const otp = createOtp(normalizedEmail, type);

  // Gửi qua email
  await sendOtpEmail(normalizedEmail, otp, type);

  return { success: true };
};

/**
 * =========================================================
 * VERIFY OTP SERVICE
 * =========================================================
 */
export const verifyOtpService = (
  email: string,
  otp: string,
  type: OTPType,
): {
  success: boolean;
  message?: string;
} => {
  const normalizedEmail = normalizeEmail(email);
  const otpData = otpStore.get(normalizedEmail);

  if (!otpData) {
    return {
      success: false,
      message: "OTP không tồn tại hoặc đã hết hạn.",
    };
  }

  if (otpData.type !== type) {
    return {
      success: false,
      message: "OTP không hợp lệ cho chức năng này.",
    };
  }

  if (isOtpExpired(otpData)) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới.",
    };
  }

  if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message:
        "Bạn đã nhập sai OTP quá số lần cho phép. Vui lòng yêu cầu OTP mới.",
    };
  }

  if (otpData.otp !== otp) {
    otpData.attempts += 1;

    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(normalizedEmail);
      return {
        success: false,
        message:
          "Bạn đã nhập sai OTP quá số lần cho phép. Vui lòng yêu cầu OTP mới.",
      };
    }

    return {
      success: false,
      message: `OTP không đúng. Bạn còn ${
        MAX_OTP_ATTEMPTS - otpData.attempts
      } lần thử.`,
    };
  }

  // OTP chính xác
  otpData.verified = true;

  return {
    success: true,
  };
};

/**
 * =========================================================
 * KIỂM TRA EMAIL ĐÃ VERIFY OTP ĐĂNG KÝ CHƯA
 * =========================================================
 */
export const isRegisterEmailVerified = (
  email: string,
): boolean => {
  const normalizedEmail = normalizeEmail(email);
  const otpData = otpStore.get(normalizedEmail);

  if (!otpData) {
    return false;
  }

  if (isOtpExpired(otpData)) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (otpData.type !== "register") {
    return false;
  }

  return otpData.verified;
};

/**
 * =========================================================
 * INVALIDATE OTP
 * =========================================================
 */
export const invalidateOtpService = (
  email: string,
): void => {
  const normalizedEmail = normalizeEmail(email);
  otpStore.delete(normalizedEmail);
};

export const invalidateOtp = (email: string): void => {
  invalidateOtpService(email);
};

/**
 * =========================================================
 * CONTROLLER: REQUEST / SEND OTP API
 * =========================================================
 * API: POST /api/auth/send-otp
 * Body: { "email": "example@gmail.com", "type": "register" | "reset_password" }
 */
export const requestOtp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Email và loại OTP (type) là bắt buộc.",
      });
    }

    const result = await sendOtp(email, type as OTPType);

    if (!result.success) {
      return res.status(429).json({
        success: false,
        message: result.message,
        retryAfter: result.retryAfter,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
    });
  }
};

/**
 * =========================================================
 * CONTROLLER: RESEND OTP API
 * =========================================================
 * API: POST /api/auth/resend-otp
 * Body: { "email": "example@gmail.com", "type": "register" | "reset_password" }
 */
export const resendOtp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  return requestOtp(req, res);
};

/**
 * =========================================================
 * CONTROLLER: VERIFY REGISTER OTP
 * =========================================================
 * API: POST /api/auth/register/verify-otp
 * Body: { "email": "example@gmail.com", "otp": "123456" }
 */
export const verifyRegisterOtp = (
  req: Request,
  res: Response,
): Response => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email và mã OTP là bắt buộc.",
    });
  }

  const result = verifyOtpService(email, otp, "register");

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Xác thực OTP thành công. Bạn có thể tiếp tục đăng ký tài khoản.",
  });
};

/**
 * =========================================================
 * CONTROLLER: VERIFY RESET PASSWORD OTP
 * =========================================================
 * API: POST /api/auth/reset-password/verify-otp
 * Body: { "email": "example@gmail.com", "otp": "123456" }
 */
export const verifyResetPasswordOtp = (
  req: Request,
  res: Response,
): Response => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email và mã OTP là bắt buộc.",
    });
  }

  const result = verifyOtpService(email, otp, "reset_password");

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "OTP reset mật khẩu hợp lệ.",
  });
};