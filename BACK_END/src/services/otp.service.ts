/**
 * =========================================================
 * FILE: BACK_END/src/services/otp.service.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Tạo OTP
 * - Lưu OTP tạm thời
 * - Kiểm tra OTP
 * - Giới hạn số lần nhập sai
 * - Xác định loại OTP
 * - Gửi OTP qua email
 *
 * Lưu ý:
 * - Không tạo MongoDB Model riêng cho OTP.
 * - OTP được lưu tạm trong RAM bằng Map.
 *
 * Các loại OTP:
 * - register
 * - reset_password
 *
 * =========================================================
 */

import { randomInt } from "crypto";

import { sendOtpEmail } from "../config/mail";

/**
 * =========================================================
 * OTP TYPE
 * =========================================================
 */

export type OTPType =
  | "register"
  | "reset_password";

/**
 * =========================================================
 * OTP DATA
 * =========================================================
 */

export interface OTPData {
  /**
   * Mã OTP 6 chữ số.
   */
  otp: string;

  /**
   * Thời điểm OTP hết hạn.
   * Lưu dưới dạng timestamp milliseconds.
   */
  expiresAt: number;

  /**
   * Số lần nhập OTP sai.
   */
  attempts: number;

  /**
   * Loại OTP.
   */
  type: OTPType;

  /**
   * OTP đã được xác thực hay chưa.
   */
  verified: boolean;
}

/**
 * =========================================================
 * OTP STORE
 * =========================================================
 *
 * OTP được lưu tạm trong RAM.
 *
 * Key:
 *
 * email:type
 *
 * Ví dụ:
 *
 * nguyenvana@gmail.com:register
 *
 * nguyenvana@gmail.com:reset_password
 *
 * =========================================================
 */

const otpStore = new Map<string, OTPData>();

/**
 * =========================================================
 * OTP CONFIG
 * =========================================================
 */

/**
 * OTP tồn tại trong 5 phút.
 */
const OTP_EXPIRE_TIME = 5 * 60 * 1000;

/**
 * Người dùng được nhập sai tối đa 5 lần.
 */
const MAX_ATTEMPTS = 5;

/**
 * Độ dài OTP.
 */
const OTP_LENGTH = 6;

/**
 * =========================================================
 * HELPER: NORMALIZE EMAIL
 * =========================================================
 */

const normalizeEmail = (
  email: string
): string => {
  return email.trim().toLowerCase();
};

/**
 * =========================================================
 * HELPER: GET OTP KEY
 * =========================================================
 */

const getOtpKey = (
  email: string,
  type: OTPType
): string => {
  return `${normalizeEmail(email)}:${type}`;
};

/**
 * =========================================================
 * GENERATE OTP
 * =========================================================
 *
 * Tạo OTP 6 chữ số.
 *
 * Sử dụng crypto.randomInt thay vì Math.random()
 * để OTP khó đoán hơn.
 *
 * Ví dụ:
 *
 * 123456
 * 845291
 * 390127
 *
 * =========================================================
 */

export const generateOtp = (): string => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;

  return randomInt(min, max).toString();
};

/**
 * =========================================================
 * CREATE OTP
 * =========================================================
 *
 * - Tạo OTP.
 * - Lưu OTP vào RAM.
 * - Reset số lần thử.
 * - Reset trạng thái verified.
 *
 * =========================================================
 */

export const createOtp = (
  email: string,
  type: OTPType
): string => {
  const normalizedEmail =
    normalizeEmail(email);

  const otp = generateOtp();

  const otpData: OTPData = {
    otp,

    expiresAt:
      Date.now() + OTP_EXPIRE_TIME,

    attempts: 0,

    type,

    verified: false,
  };

  const key = getOtpKey(
    normalizedEmail,
    type
  );

  otpStore.set(
    key,
    otpData
  );

  return otp;
};

/**
 * =========================================================
 * GET OTP
 * =========================================================
 *
 * Lấy OTP hiện tại.
 *
 * Nếu OTP hết hạn:
 * → Xóa khỏi RAM.
 * → Trả về null.
 *
 * =========================================================
 */

export const getOtp = (
  email: string,
  type: OTPType
): OTPData | null => {
  const key = getOtpKey(
    email,
    type
  );

  const otpData =
    otpStore.get(key);

  /**
   * Không tồn tại OTP.
   */

  if (!otpData) {
    return null;
  }

  /**
   * Kiểm tra hết hạn.
   */

  if (
    Date.now() >
    otpData.expiresAt
  ) {
    otpStore.delete(key);

    return null;
  }

  return otpData;
};

/**
 * =========================================================
 * SEND OTP
 * =========================================================
 *
 * Flow:
 *
 * createOtp()
 *      ↓
 * Lấy OTP
 *      ↓
 * sendOtpEmail()
 *
 * =========================================================
 */

export const sendOtp = async (
  email: string,
  type: OTPType
): Promise<void> => {
  const normalizedEmail =
    normalizeEmail(email);

  const otp = createOtp(
    normalizedEmail,
    type
  );

  await sendOtpEmail(
    normalizedEmail,
    otp,
    type
  );
};

/**
 * =========================================================
 * VERIFY OTP
 * =========================================================
 *
 * Kiểm tra:
 *
 * 1. OTP có tồn tại không?
 * 2. OTP có hết hạn không?
 * 3. OTP đã được verify chưa?
 * 4. OTP có đúng không?
 * 5. Số lần nhập sai có vượt giới hạn không?
 *
 * Return:
 *
 * true  → OTP hợp lệ.
 * false → OTP không hợp lệ.
 *
 * =========================================================
 */

export const verifyOtpService = (
  email: string,
  otp: string,
  type: OTPType
): boolean => {
  const normalizedEmail =
    normalizeEmail(email);

  const normalizedOtp =
    otp.trim();

  const key = getOtpKey(
    normalizedEmail,
    type
  );

  const otpData = getOtp(
    normalizedEmail,
    type
  );

  /**
   * Không tồn tại hoặc đã hết hạn.
   */

  if (!otpData) {
    return false;
  }

  /**
   * OTP đã được sử dụng.
   *
   * Không cho phép sử dụng lại.
   */

  if (otpData.verified) {
    return false;
  }

  /**
   * Kiểm tra OTP.
   */

  if (
    otpData.otp !==
    normalizedOtp
  ) {
    otpData.attempts += 1;

    /**
     * Vượt quá số lần nhập sai.
     */

    if (
      otpData.attempts >=
      MAX_ATTEMPTS
    ) {
      otpStore.delete(key);

      return false;
    }

    /**
     * Lưu lại số lần nhập sai.
     */

    otpStore.set(
      key,
      otpData
    );

    return false;
  }

  /**
   * OTP chính xác.
   */

  otpData.verified = true;

  otpStore.set(
    key,
    otpData
  );

  return true;
};

/**
 * =========================================================
 * CHECK REGISTER EMAIL VERIFIED
 * =========================================================
 *
 * Kiểm tra email đã verify OTP đăng ký hay chưa.
 *
 * =========================================================
 */

export const isRegisterEmailVerified = (
  email: string
): boolean => {
  const otpData = getOtp(
    email,
    "register"
  );

  return (
    otpData?.verified === true
  );
};

/**
 * =========================================================
 * INVALIDATE OTP
 * =========================================================
 *
 * Xóa OTP khỏi RAM.
 *
 * Dùng sau khi:
 *
 * - Đăng ký thành công.
 * - Reset password thành công.
 * - OTP bị khóa do nhập sai quá nhiều lần.
 *
 * =========================================================
 */

export const invalidateOtpService = (
  email: string,
  type: OTPType
): void => {
  const key = getOtpKey(
    email,
    type
  );

  otpStore.delete(key);
};

/**
 * =========================================================
 * EXPORT DEFAULT
 * =========================================================
 */

export default {
  generateOtp,
  createOtp,
  getOtp,
  sendOtp,
  verifyOtpService,
  isRegisterEmailVerified,
  invalidateOtpService,
};