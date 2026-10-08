/**
 * =========================================================
 * FILE: BACK_END/src/services/auth.service.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Xử lý toàn bộ BUSINESS LOGIC của Authentication.
 *
 * KIẾN TRÚC:
 *
 * Controller
 *      ↓
 * Auth Service
 *      ↓
 * ┌───────────────┐
 * │ User Model    │
 * │ OTP Service   │
 * │ JWT Utils     │
 * └───────────────┘
 *      ↓
 * MongoDB / Email
 *
 * SERVICE KHÔNG:
 * - Đọc trực tiếp req/res.
 * - Trả HTTP response.
 * - Validate request bằng express-validator.
 *
 * SERVICE CÓ:
 * - Kiểm tra User.
 * - Kiểm tra trạng thái tài khoản.
 * - Hash password bằng bcrypt.
 * - Kiểm tra password.
 * - Gọi OTP Service.
 * - Tạo tài khoản.
 * - Đăng nhập.
 * - Quên mật khẩu.
 * - Reset password.
 * - Đổi password.
 * - Tạo JWT.
 *
 * =========================================================
 */

import bcrypt from "bcrypt";

import User, {
  IUser,
  UserStatus,
} from "../models/User.model";

import {
  isRegisterEmailVerified,
  invalidateOtpService,
  sendOtp,
  verifyOtpService,
} from "./otp.service";

import { generateToken } from "../utils/jwt";

/**
 * =========================================================
 * BCRYPT CONFIG
 * =========================================================
 *
 * Salt rounds càng cao:
 * - Password càng khó brute-force.
 * - Nhưng thời gian hash sẽ lâu hơn.
 *
 * 12 là mức phù hợp cho project hiện tại.
 *
 * =========================================================
 */

const BCRYPT_SALT_ROUNDS = 12;

/**
 * =========================================================
 * TYPE AUTH RESULT
 * =========================================================
 *
 * Dữ liệu trả về sau:
 * - Register
 * - Login
 *
 * Tuyệt đối không trả password.
 *
 * =========================================================
 */

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: "customer" | "admin";
    status: UserStatus;
    emailVerifiedAt: Date | null;
  };

  token: string;
}

/**
 * =========================================================
 * HELPER: NORMALIZE EMAIL
 * =========================================================
 *
 * Đảm bảo email:
 * - Không có khoảng trắng đầu/cuối.
 * - Chuyển thành chữ thường.
 *
 * Ví dụ:
 *
 * "  Admin@Gmail.COM "
 *
 * ↓
 *
 * "admin@gmail.com"
 *
 * =========================================================
 */

const normalizeEmail = (
  email: string
): string => {
  return email.trim().toLowerCase();
};

/**
 * =========================================================
 * HELPER: FORMAT USER
 * =========================================================
 *
 * Chỉ trả những thông tin cần thiết cho Frontend.
 *
 * TUYỆT ĐỐI KHÔNG trả:
 * - password
 * - password hash
 *
 * =========================================================
 */

const formatUser = (user: IUser) => ({
  id: user._id.toString(),

  name: user.name,

  email: user.email,

  phone: user.phone ?? null,

  avatar: user.avatar ?? null,

  role: user.role,

  status: user.status,

  emailVerifiedAt:
    user.emailVerifiedAt ?? null,
});

/**
 * =========================================================
 * HELPER: GENERATE ACCESS TOKEN
 * =========================================================
 *
 * JWT được tạo thông qua:
 *
 * utils/jwt.ts
 *
 * Service không tự xử lý:
 * - JWT_SECRET
 * - JWT_EXPIRES_IN
 * - jwt.sign()
 *
 * =========================================================
 */

const generateAccessToken = (
  user: IUser
): string => {
  return generateToken({
    userId: user._id.toString(),
    role: user.role,
  });
};

/**
 * =========================================================
 * 1. REQUEST REGISTER OTP
 * =========================================================
 *
 * BƯỚC:
 *
 * User nhập email
 *      ↓
 * Validator kiểm tra email
 *      ↓
 * Service kiểm tra email trong Database
 *      ↓
 * Email chưa tồn tại
 *      ↓
 * OTP Service tạo OTP
 *      ↓
 * Gửi OTP qua Email
 *
 * CHƯA tạo User ở bước này.
 *
 * =========================================================
 */

export const requestRegisterOtp = async (
  email: string
): Promise<void> => {
  const normalizedEmail =
    normalizeEmail(email);

  /**
   * Kiểm tra email đã tồn tại chưa.
   */

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "Email đã được sử dụng."
    );
  }

  /**
   * Gửi OTP đăng ký.
   */

  await sendOtp(
    normalizedEmail,
    "register"
  );
};

/**
 * =========================================================
 * 2. VERIFY REGISTER OTP
 * =========================================================
 *
 * OTP đúng:
 *
 * → OTP Service đánh dấu verified = true.
 *
 * Sau bước này Frontend mới được chuyển sang
 * form nhập thông tin tài khoản.
 *
 * =========================================================
 */

export const verifyRegisterOtp = (
  email: string,
  otp: string
): void => {
  const normalizedEmail =
    normalizeEmail(email);

  const isValid =
    verifyOtpService(
      normalizedEmail,
      otp,
      "register"
    );

  if (!isValid) {
    throw new Error(
      "OTP không hợp lệ hoặc đã hết hạn."
    );
  }
};

/**
 * =========================================================
 * 3. REGISTER
 * =========================================================
 *
 * Đây là bước TẠO USER.
 *
 * Điều kiện:
 *
 * 1. Email đã verify OTP.
 * 2. Email chưa tồn tại.
 * 3. Dữ liệu đã qua Validator.
 * 4. Password và confirmPassword đã khớp.
 *
 * Password:
 *
 * Plain password
 *      ↓
 * bcrypt.hash()
 *      ↓
 * Password hash
 *      ↓
 * MongoDB
 *
 * =========================================================
 */

export const register = async (
  data: {
    email: string;
    name: string;
    phone?: string;
    password: string;
  }
): Promise<AuthResult> => {
  const normalizedEmail =
    normalizeEmail(data.email);

  /**
   * -------------------------------------------------------
   * BƯỚC 1:
   * KIỂM TRA EMAIL ĐÃ VERIFY OTP
   * -------------------------------------------------------
   */

  const emailVerified =
    isRegisterEmailVerified(
      normalizedEmail
    );

  if (!emailVerified) {
    throw new Error(
      "Email chưa được xác thực OTP."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 2:
   * KIỂM TRA EMAIL TRONG DATABASE
   * -------------------------------------------------------
   *
   * Kiểm tra lại lần nữa trước khi tạo User.
   */

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "Email đã được sử dụng."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * HASH PASSWORD
   * -------------------------------------------------------
   */

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * TẠO USER
   * -------------------------------------------------------
   *
   * User đăng ký thông thường:
   *
   * role   = customer
   * status = active
   *
   */

  const user =
    await User.create({
      name: data.name.trim(),

      email: normalizedEmail,

      phone:
        data.phone?.trim() || null,

      password: hashedPassword,

      role: "customer",

      status: "active",

      emailVerifiedAt: new Date(),
    });

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * XÓA OTP ĐĂNG KÝ
   * -------------------------------------------------------
   *
   * OTP đã sử dụng → không được sử dụng lại.
   */

  invalidateOtpService(
    normalizedEmail,
    "register"
  );

  /**
   * -------------------------------------------------------
   * BƯỚC 6:
   * TẠO JWT
   * -------------------------------------------------------
   */

  const token =
    generateAccessToken(user);

  /**
   * -------------------------------------------------------
   * BƯỚC 7:
   * TRẢ KẾT QUẢ
   * -------------------------------------------------------
   */

  return {
    user: formatUser(user),
    token,
  };
};

/**
 * =========================================================
 * 4. LOGIN
 * =========================================================
 *
 * Dùng chung cho:
 *
 * - customer
 * - admin
 *
 * Không cần Admin Model riêng.
 *
 * Role được lấy từ:
 *
 * user.role
 *
 * =========================================================
 */

export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const normalizedEmail =
    normalizeEmail(email);

  /**
   * -------------------------------------------------------
   * BƯỚC 1:
   * TÌM USER
   * -------------------------------------------------------
   *
   * User.model.ts:
   *
   * password: {
   *   select: false
   * }
   *
   * Vì vậy phải:
   *
   * .select("+password")
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  /**
   * Không tiết lộ email có tồn tại hay không.
   */

  if (!user) {
    throw new Error(
      "Email hoặc mật khẩu không chính xác."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 2:
   * KIỂM TRA STATUS
   * -------------------------------------------------------
   */

  if (user.status === "blocked") {
    throw new Error(
      "Tài khoản đã bị khóa."
    );
  }

  if (user.status === "inactive") {
    throw new Error(
      "Tài khoản đang không hoạt động."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * KIỂM TRA PASSWORD
   * -------------------------------------------------------
   */

  const passwordCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordCorrect) {
    throw new Error(
      "Email hoặc mật khẩu không chính xác."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * TẠO JWT
   * -------------------------------------------------------
   */

  const token =
    generateAccessToken(user);

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * TRẢ KẾT QUẢ
   * -------------------------------------------------------
   */

  return {
    user: formatUser(user),
    token,
  };
};

/**
 * =========================================================
 * 5. FORGOT PASSWORD
 * =========================================================
 *
 * Customer và Admin đều sử dụng chung.
 *
 * Flow:
 *
 * Email
 *   ↓
 * Tìm User
 *   ↓
 * Check status
 *   ↓
 * Gửi OTP reset_password
 *
 * =========================================================
 */

export const forgotPassword = async (
  email: string
): Promise<void> => {
  const normalizedEmail =
    normalizeEmail(email);

  /**
   * Tìm User.
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    });

  /**
   * Không tồn tại User.
   */

  if (!user) {
    throw new Error(
      "Không tìm thấy tài khoản với email này."
    );
  }

  /**
   * Không cho tài khoản blocked reset password.
   */

  if (user.status === "blocked") {
    throw new Error(
      "Tài khoản đã bị khóa."
    );
  }

  /**
   * Không cho tài khoản inactive reset password.
   */

  if (user.status === "inactive") {
    throw new Error(
      "Tài khoản đang không hoạt động."
    );
  }

  /**
   * Gửi OTP reset password.
   */

  await sendOtp(
    normalizedEmail,
    "reset_password"
  );
};

/**
 * =========================================================
 * 6. RESET PASSWORD
 * =========================================================
 *
 * Input:
 *
 * - email
 * - otp
 * - newPassword
 *
 * Flow:
 *
 * OTP
 *   ↓
 * Verify OTP
 *   ↓
 * Lấy User + password cũ
 *   ↓
 * Check password mới != password cũ
 *   ↓
 * bcrypt.hash()
 *   ↓
 * Update
 *   ↓
 * Invalidate OTP
 *
 * =========================================================
 */

export const resetPassword = async (
  data: {
    email: string;
    otp: string;
    newPassword: string;
  }
): Promise<void> => {
  const normalizedEmail =
    normalizeEmail(data.email);

  /**
   * -------------------------------------------------------
   * BƯỚC 1:
   * VERIFY OTP
   * -------------------------------------------------------
   */

  const otpValid =
    verifyOtpService(
      normalizedEmail,
      data.otp,
      "reset_password"
    );

  if (!otpValid) {
    throw new Error(
      "OTP không hợp lệ hoặc đã hết hạn."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 2:
   * LẤY USER + PASSWORD CŨ
   * -------------------------------------------------------
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  /**
   * Nếu User bị xóa sau khi OTP được gửi.
   */

  if (!user) {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw new Error(
      "Không tìm thấy tài khoản."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * KIỂM TRA STATUS
   * -------------------------------------------------------
   */

  if (user.status === "blocked") {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw new Error(
      "Tài khoản đã bị khóa."
    );
  }

  if (user.status === "inactive") {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw new Error(
      "Tài khoản đang không hoạt động."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * PASSWORD MỚI KHÔNG ĐƯỢC GIỐNG PASSWORD CŨ
   * -------------------------------------------------------
   *
   * Không thể dùng:
   *
   * data.newPassword === user.password
   *
   * vì user.password là HASH.
   *
   * Phải dùng bcrypt.compare().
   */

  const samePassword =
    await bcrypt.compare(
      data.newPassword,
      user.password
    );

  if (samePassword) {
    throw new Error(
      "Mật khẩu mới không được trùng với mật khẩu cũ."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * HASH PASSWORD MỚI
   * -------------------------------------------------------
   */

  const hashedPassword =
    await bcrypt.hash(
      data.newPassword,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * -------------------------------------------------------
   * BƯỚC 6:
   * CẬP NHẬT PASSWORD
   * -------------------------------------------------------
   */

  user.password =
    hashedPassword;

  await user.save();

  /**
   * -------------------------------------------------------
   * BƯỚC 7:
   * INVALIDATE OTP
   * -------------------------------------------------------
   */

  invalidateOtpService(
    normalizedEmail,
    "reset_password"
  );
};

/**
 * =========================================================
 * 7. GET CURRENT USER
 * =========================================================
 *
 * Dùng cho:
 *
 * GET /api/auth/me
 *
 * Auth Middleware:
 *
 * JWT
 * ↓
 * userId
 * ↓
 * Controller
 * ↓
 * Service
 *
 * Service chỉ chịu trách nhiệm tìm User.
 *
 * =========================================================
 */

export const getCurrentUser = async (
  userId: string
): Promise<ReturnType<typeof formatUser>> => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error(
      "Không tìm thấy người dùng."
    );
  }

  return formatUser(user);
};

/**
 * =========================================================
 * 8. CHANGE PASSWORD
 * =========================================================
 *
 * Dành cho User đã đăng nhập.
 *
 * Input:
 *
 * - currentPassword
 * - newPassword
 *
 * Không cần OTP vì User đã xác thực bằng JWT.
 *
 * =========================================================
 */

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  /**
   * -------------------------------------------------------
   * BƯỚC 1:
   * LẤY USER + PASSWORD HASH
   * -------------------------------------------------------
   */

  const user =
    await User.findById(
      userId
    ).select("+password");

  if (!user) {
    throw new Error(
      "Không tìm thấy người dùng."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 2:
   * KIỂM TRA STATUS
   * -------------------------------------------------------
   */

  if (user.status !== "active") {
    throw new Error(
      "Tài khoản không ở trạng thái hoạt động."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * KIỂM TRA PASSWORD HIỆN TẠI
   * -------------------------------------------------------
   */

  const currentPasswordCorrect =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!currentPasswordCorrect) {
    throw new Error(
      "Mật khẩu hiện tại không chính xác."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * PASSWORD MỚI KHÔNG ĐƯỢC GIỐNG PASSWORD CŨ
   * -------------------------------------------------------
   */

  const samePassword =
    await bcrypt.compare(
      newPassword,
      user.password
    );

  if (samePassword) {
    throw new Error(
      "Mật khẩu mới không được trùng với mật khẩu cũ."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * HASH PASSWORD MỚI
   * -------------------------------------------------------
   */

  user.password =
    await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * -------------------------------------------------------
   * BƯỚC 6:
   * LƯU DATABASE
   * -------------------------------------------------------
   */

  await user.save();
};