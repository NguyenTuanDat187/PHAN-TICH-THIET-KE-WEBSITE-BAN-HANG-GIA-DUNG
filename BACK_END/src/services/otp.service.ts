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
 * - Chống spam gửi lại OTP
 * - Ràng buộc OTP với userId khi cần thiết
 *
 * LƯU Ý:
 * - Không tạo MongoDB Model riêng cho OTP.
 * - OTP được lưu tạm trong RAM bằng Map.
 *
 * CÁC LOẠI OTP:
 * - register
 * - reset_password
 * - change_email
 *
 * =========================================================
 */

import { randomInt } from "crypto";

import { sendOtpEmail } from "../config/mail";

/**
 * =========================================================
 * OTP TYPE
 * =========================================================
 *
 * register:
 * - Xác thực email khi đăng ký tài khoản.
 *
 * reset_password:
 * - Xác thực OTP để đặt lại mật khẩu.
 *
 * change_email:
 * - Xác thực OTP khi admin đổi email.
 *
 * =========================================================
 */

export type OTPType =
  | "register"
  | "reset_password"
  | "change_email";

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
   *
   * Lưu dưới dạng timestamp milliseconds.
   */
  expiresAt: number;

  /**
   * Thời điểm được phép gửi OTP mới.
   *
   * Dùng để chống spam gửi OTP liên tục.
   */
  nextResendAt: number;

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

  /**
   * User ID được phép sử dụng OTP.
   *
   * - register: không cần.
   * - reset_password: có thể không cần.
   * - change_email: bắt buộc.
   *
   * Việc này giúp OTP đổi email được gắn
   * với đúng admin đang thực hiện yêu cầu.
   */
  userId?: string;
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
 * nguyenvana@gmail.com:reset_password
 * admin@gmail.com:change_email
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
 * Người dùng phải chờ 60 giây
 * trước khi yêu cầu OTP mới.
 */
const OTP_RESEND_COOLDOWN = 60 * 1000;

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

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * =========================================================
 * HELPER: GET OTP KEY
 * =========================================================
 *
 * Mỗi loại OTP có một key riêng.
 *
 * Ví dụ:
 *
 * user@gmail.com:register
 * user@gmail.com:reset_password
 * user@gmail.com:change_email
 *
 * =========================================================
 */

const getOtpKey = (
  email: string,
  type: OTPType,
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
 * MỤC ĐÍCH:
 * - Tạo OTP mới.
 * - Lưu OTP vào RAM.
 * - Reset số lần nhập sai.
 * - Reset trạng thái verified.
 * - Thiết lập thời gian hết hạn.
 * - Thiết lập thời gian cooldown.
 *
 * userId:
 * - Có thể truyền khi OTP cần gắn với user cụ thể.
 * - Đặc biệt dùng cho change_email.
 *
 * =========================================================
 */

export const createOtp = (
  email: string,
  type: OTPType,
  userId?: string,
): string => {
  const normalizedEmail = normalizeEmail(email);

  const otp = generateOtp();

  const now = Date.now();

  const otpData: OTPData = {
    otp,

    /**
     * OTP có hiệu lực trong 5 phút.
     */
    expiresAt: now + OTP_EXPIRE_TIME,

    /**
     * Chỉ được yêu cầu OTP mới
     * sau 60 giây.
     */
    nextResendAt: now + OTP_RESEND_COOLDOWN,

    /**
     * Reset số lần nhập sai.
     */
    attempts: 0,

    /**
     * Loại OTP.
     */
    type,

    /**
     * OTP mới chưa được xác thực.
     */
    verified: false,

    /**
     * User ID nếu có.
     */
    userId,
  };

  const key = getOtpKey(
    normalizedEmail,
    type,
  );

  otpStore.set(key, otpData);

  return otp;
};

/**
 * =========================================================
 * GET OTP
 * =========================================================
 *
 * Lấy OTP hiện tại.
 *
 * Nếu OTP không tồn tại:
 * → return null
 *
 * Nếu OTP hết hạn:
 * → Xóa khỏi RAM
 * → return null
 *
 * =========================================================
 */

export const getOtp = (
  email: string,
  type: OTPType,
): OTPData | null => {
  const key = getOtpKey(
    email,
    type,
  );

  const otpData = otpStore.get(key);

  /**
   * OTP không tồn tại.
   */
  if (!otpData) {
    return null;
  }

  /**
   * OTP đã hết hạn.
   */
  if (Date.now() > otpData.expiresAt) {
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
 * MỤC ĐÍCH:
 * - Kiểm tra cooldown.
 * - Tạo OTP.
 * - Lưu OTP.
 * - Gửi OTP qua email.
 *
 * Return:
 *
 * success = true
 * → gửi thành công.
 *
 * success = false
 * → đang trong thời gian cooldown.
 *
 * =========================================================
 */

export const sendOtp = async (
  email: string,
  type: OTPType,
  userId?: string,
): Promise<{
  success: boolean;
  message?: string;
  retryAfter?: number;
}> => {
  const normalizedEmail = normalizeEmail(email);

  const existingOtp = getOtp(
    normalizedEmail,
    type,
  );

  const now = Date.now();

  /**
   * -------------------------------------------------------
   * KIỂM TRA COOLDOWN
   * -------------------------------------------------------
   *
   * Không cho phép gửi OTP mới liên tục.
   */
  if (
    existingOtp &&
    now < existingOtp.nextResendAt
  ) {
    const retryAfter = Math.ceil(
      (existingOtp.nextResendAt - now) / 1000,
    );

    return {
      success: false,
      message: `Vui lòng đợi ${retryAfter} giây trước khi yêu cầu gửi lại OTP mới.`,
      retryAfter,
    };
  }

  /**
   * -------------------------------------------------------
   * TẠO OTP MỚI
   * -------------------------------------------------------
   */

  const otp = createOtp(
    normalizedEmail,
    type,
    userId,
  );

  try {
    /**
     * -----------------------------------------------------
     * GỬI OTP QUA EMAIL
     * -----------------------------------------------------
     */

    await sendOtpEmail(
      normalizedEmail,
      otp,
      type,
    );

    return {
      success: true,
    };
  } catch (error) {
    /**
     * -----------------------------------------------------
     * NẾU GỬI EMAIL THẤT BẠI
     * -----------------------------------------------------
     *
     * Xóa OTP vừa tạo để người dùng
     * có thể yêu cầu gửi lại.
     */

    invalidateOtpService(
      normalizedEmail,
      type,
    );

    throw error;
  }
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
 * 4. UserId có đúng không?
 * 5. OTP có đúng không?
 * 6. Số lần nhập sai có vượt giới hạn không?
 *
 * Return:
 *
 * true:
 * → OTP hợp lệ.
 *
 * false:
 * → OTP không hợp lệ.
 *
 * =========================================================
 */

export const verifyOtpService = (
  email: string,
  otp: string,
  type: OTPType,
  userId?: string,
): boolean => {
  const normalizedEmail = normalizeEmail(email);

  const normalizedOtp = otp.trim();

  const key = getOtpKey(
    normalizedEmail,
    type,
  );

  const otpData = getOtp(
    normalizedEmail,
    type,
  );

  /**
   * -------------------------------------------------------
   * BƯỚC 1:
   * OTP không tồn tại hoặc đã hết hạn.
   * -------------------------------------------------------
   */

  if (!otpData) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 2:
   * OTP đã được sử dụng.
   * -------------------------------------------------------
   */

  if (otpData.verified) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * KIỂM TRA USER ID
   * -------------------------------------------------------
   *
   * Nếu OTP được gắn userId thì bắt buộc
   * userId khi verify phải trùng.
   *
   * Đặc biệt dùng cho change_email.
   */

  if (
    otpData.userId &&
    otpData.userId !== userId
  ) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * KIỂM TRA SỐ LẦN NHẬP SAI
   * -------------------------------------------------------
   */

  if (
    otpData.attempts >= MAX_ATTEMPTS
  ) {
    otpStore.delete(key);

    return false;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * KIỂM TRA OTP
   * -------------------------------------------------------
   */

  if (
    otpData.otp !== normalizedOtp
  ) {
    otpData.attempts += 1;

    /**
     * Nếu nhập sai đủ 5 lần:
     * → Xóa OTP.
     */

    if (
      otpData.attempts >= MAX_ATTEMPTS
    ) {
      otpStore.delete(key);

      return false;
    }

    /**
     * Lưu lại số lần nhập sai.
     */

    otpStore.set(
      key,
      otpData,
    );

    return false;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 6:
   * OTP CHÍNH XÁC
   * -------------------------------------------------------
   */

  otpData.verified = true;

  otpStore.set(
    key,
    otpData,
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
  email: string,
): boolean => {
  const otpData = getOtp(
    email,
    "register",
  );

  return otpData?.verified === true;
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
 * - Đổi email thành công.
 * - OTP bị khóa do nhập sai quá nhiều lần.
 *
 * =========================================================
 */

export const invalidateOtpService = (
  email: string,
  type: OTPType,
): void => {
  const key = getOtpKey(
    email,
    type,
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