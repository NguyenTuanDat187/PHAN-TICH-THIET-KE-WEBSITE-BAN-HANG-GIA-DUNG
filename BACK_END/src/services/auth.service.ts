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
 * ┌─────────────────────┐
 * │ User Model          │
 * │ OTP Service         │
 * │ JWT Utils           │
 * └─────────────────────┘
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
 * - Kiểm tra role.
 * - Kiểm tra trạng thái tài khoản.
 * - Hash password bằng bcrypt.
 * - Kiểm tra password.
 * - Gọi OTP Service.
 * - Tạo tài khoản customer.
 * - Đăng nhập customer.
 * - Đăng nhập admin.
 * - Quên mật khẩu customer/admin.
 * - Reset password customer/admin.
 * - Đổi password customer/admin.
 * - Đổi email admin.
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
 * - Admin Login
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
 * " Admin@Gmail.COM "
 *
 * ↓
 *
 * "admin@gmail.com"
 *
 * =========================================================
 */

const normalizeEmail = (email: string): string => {
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
 * HELPER: CHECK USER STATUS
 * =========================================================
 *
 * Dùng chung cho nhiều chức năng.
 *
 * Không cho:
 * - blocked
 * - inactive
 *
 * =========================================================
 */

const checkUserStatus = (
  user: IUser
): void => {
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
};

/**
 * =========================================================
 * HELPER: CHECK ADMIN
 * =========================================================
 *
 * Chỉ tài khoản có:
 *
 * role = admin
 *
 * mới được sử dụng các chức năng Admin.
 *
 * =========================================================
 */

const checkAdminRole = (
  user: IUser
): void => {
  if (user.role !== "admin") {
    throw new Error(
      "Bạn không có quyền truy cập chức năng quản trị."
    );
  }
};

/**
 * =========================================================
 * 1. REQUEST REGISTER OTP
 * =========================================================
 *
 * User nhập email
 *      ↓
 * Validator kiểm tra email
 *      ↓
 * Service kiểm tra email Database
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

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "Email đã được sử dụng."
    );
  }

  await sendOtp(
    normalizedEmail,
    "register"
  );
};

/**
 * =========================================================
 * 2. VERIFY REGISTER OTP
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
 * Điều kiện:
 * 1. Email đã verify OTP.
 * 2. Email chưa tồn tại.
 * 3. Dữ liệu đã qua Validator.
 * 4. Password và confirmPassword đã khớp.
 *
 * User đăng ký:
 *
 * role   = customer
 * status = active
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
   * Kiểm tra email đã verify OTP.
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
   * Kiểm tra email trong Database
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
   * Hash password.
   */

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * Tạo customer.
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
   * OTP đã sử dụng → xóa/invalidate.
   */

  invalidateOtpService(
    normalizedEmail,
    "register"
  );

  /**
   * Tạo JWT.
   */

  const token =
    generateAccessToken(user);

  /**
   * Trả kết quả.
   */

  return {
    user: formatUser(user),
    token,
  };
};

/**
 * =========================================================
 * 4. LOGIN CUSTOMER
 * =========================================================
 *
 * Customer sử dụng login chung.
 *
 * Admin sẽ sử dụng:
 *
 * adminLogin()
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
   * password có select:false
   * nên phải select("+password").
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  if (!user) {
    throw new Error(
      "Email hoặc mật khẩu không chính xác."
    );
  }

  /**
   * Kiểm tra trạng thái.
   */

  checkUserStatus(user);

  /**
   * Kiểm tra password.
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
   * Tạo JWT.
   */

  const token =
    generateAccessToken(user);

  return {
    user: formatUser(user),
    token,
  };
};

/**
 * =========================================================
 * 5. FORGOT PASSWORD CUSTOMER
 * =========================================================
 */

export const forgotPassword = async (
  email: string
): Promise<void> => {
  const normalizedEmail =
    normalizeEmail(email);

  const user =
    await User.findOne({
      email: normalizedEmail,
    });

  if (!user) {
    throw new Error(
      "Không tìm thấy tài khoản với email này."
    );
  }

  checkUserStatus(user);

  await sendOtp(
    normalizedEmail,
    "reset_password"
  );
};

/**
 * =========================================================
 * 6. RESET PASSWORD CUSTOMER
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
   * VERIFY OTP
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
   * Lấy User + password cũ.
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

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
   * Kiểm tra status.
   */

  try {
    checkUserStatus(user);
  } catch (error) {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw error;
  }

  /**
   * Password mới không được giống password cũ.
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
   * Hash password mới.
   */

  const hashedPassword =
    await bcrypt.hash(
      data.newPassword,
      BCRYPT_SALT_ROUNDS
    );

  user.password =
    hashedPassword;

  await user.save();

  /**
   * OTP chỉ sử dụng một lần.
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
 */

export const getCurrentUser = async (
  userId: string
): Promise<
  ReturnType<typeof formatUser>
> => {
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
 * 8. CHANGE PASSWORD CUSTOMER
 * =========================================================
 */

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
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
   * Chỉ tài khoản active mới được đổi password.
   */

  if (user.status !== "active") {
    throw new Error(
      "Tài khoản không ở trạng thái hoạt động."
    );
  }

  /**
   * Kiểm tra password hiện tại.
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
   * Password mới không được giống password cũ.
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
   * Hash password mới.
   */

  user.password =
    await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * Lưu Database.
   */

  await user.save();
};

/**
 * =========================================================
 * =========================================================
 *
 *                 ADMIN AUTHENTICATION
 *
 * =========================================================
 * =========================================================
 *
 * Admin sử dụng chung User.model.
 *
 * Phân biệt:
 *
 * role = "admin"
 *
 * Không tạo Admin.model riêng.
 *
 * =========================================================
 */


/**
 * =========================================================
 * 9. ADMIN LOGIN
 * =========================================================
 *
 * ADMIN DUY NHẤT.
 *
 * Flow:
 *
 * Email
 *   ↓
 * Tìm User
 *   ↓
 * role === admin ?
 *   ↓
 * Check status
 *   ↓
 * Check password
 *   ↓
 * JWT
 *
 * Customer không thể đăng nhập qua endpoint Admin.
 *
 * =========================================================
 */

export const adminLogin = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const normalizedEmail =
    normalizeEmail(email);

  /**
   * Tìm User theo email.
   *
   * password có select:false
   * nên phải select("+password").
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  if (!user) {
    throw new Error(
      "Email hoặc mật khẩu admin không chính xác."
    );
  }

  /**
   * BẮT BUỘC phải là admin.
   */

  checkAdminRole(user);

  /**
   * Kiểm tra trạng thái.
   */

  checkUserStatus(user);

  /**
   * Kiểm tra password.
   */

  const passwordCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordCorrect) {
    throw new Error(
      "Email hoặc mật khẩu admin không chính xác."
    );
  }

  /**
   * Tạo JWT.
   *
   * JWT chứa:
   * - userId
   * - role = admin
   */

  const token =
    generateAccessToken(user);

  return {
    user: formatUser(user),
    token,
  };
};


/**
 * =========================================================
 * 10. ADMIN FORGOT PASSWORD
 * =========================================================
 *
 * Flow:
 *
 * Admin nhập email
 *       ↓
 * Tìm User
 *       ↓
 * Kiểm tra role = admin
 *       ↓
 * Kiểm tra status
 *       ↓
 * Gửi OTP reset_password
 *
 * =========================================================
 */

export const adminForgotPassword = async (
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

  if (!user) {
    throw new Error(
      "Không tìm thấy tài khoản admin."
    );
  }

  /**
   * Chỉ admin được sử dụng chức năng này.
   */

  checkAdminRole(user);

  /**
   * Kiểm tra trạng thái.
   */

  checkUserStatus(user);

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
 * 11. ADMIN RESET PASSWORD
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
 * Tìm User
 *   ↓
 * Kiểm tra role admin
 *   ↓
 * Kiểm tra status
 *   ↓
 * Password mới != password cũ
 *   ↓
 * Hash
 *   ↓
 * Update
 *   ↓
 * Invalidate OTP
 *
 * =========================================================
 */

export const adminResetPassword = async (
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
   * LẤY ADMIN + PASSWORD
   * -------------------------------------------------------
   */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  if (!user) {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw new Error(
      "Không tìm thấy tài khoản admin."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 3:
   * KIỂM TRA ROLE ADMIN
   * -------------------------------------------------------
   */

  if (user.role !== "admin") {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw new Error(
      "Tài khoản không có quyền quản trị."
    );
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 4:
   * KIỂM TRA STATUS
   * -------------------------------------------------------
   */

  try {
    checkUserStatus(user);
  } catch (error) {
    invalidateOtpService(
      normalizedEmail,
      "reset_password"
    );

    throw error;
  }

  /**
   * -------------------------------------------------------
   * BƯỚC 5:
   * PASSWORD MỚI KHÔNG ĐƯỢC GIỐNG PASSWORD CŨ
   * -------------------------------------------------------
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
   * BƯỚC 6:
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
   * BƯỚC 7:
   * UPDATE PASSWORD
   * -------------------------------------------------------
   */

  user.password =
    hashedPassword;

  await user.save();

  /**
   * -------------------------------------------------------
   * BƯỚC 8:
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
 * 12. ADMIN CHANGE PASSWORD
 * =========================================================
 *
 * Admin đã đăng nhập.
 *
 * Không cần OTP.
 *
 * JWT
 *   ↓
 * userId
 *   ↓
 * Tìm User
 *   ↓
 * role = admin
 *   ↓
 * currentPassword
 *   ↓
 * newPassword
 *
 * =========================================================
 */

export const adminChangePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  /**
   * Lấy admin + password hash.
   */

  const user =
    await User.findById(
      userId
    ).select("+password");

  if (!user) {
    throw new Error(
      "Không tìm thấy tài khoản admin."
    );
  }

  /**
   * Bắt buộc là admin.
   */

  checkAdminRole(user);

  /**
   * Admin phải active.
   */

  if (user.status !== "active") {
    throw new Error(
      "Tài khoản admin không ở trạng thái hoạt động."
    );
  }

  /**
   * Kiểm tra password hiện tại.
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
   * Password mới không được giống password cũ.
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
   * Hash password mới.
   */

  user.password =
    await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

  /**
   * Lưu Database.
   */

  await user.save();
};


/**
 * =========================================================
 * 13. ADMIN GET CURRENT USER
 * =========================================================
 *
 * Dùng cho:
 *
 * GET /api/admin/auth/me
 *
 * Flow:
 *
 * JWT
 *  ↓
 * userId
 *  ↓
 * Middleware
 *  ↓
 * Service
 *  ↓
 * User
 *
 * Chỉ trả admin.
 *
 * =========================================================
 */

export const adminGetCurrentUser = async (
  userId: string
): Promise<
  ReturnType<typeof formatUser>
> => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error(
      "Không tìm thấy tài khoản admin."
    );
  }

  /**
   * Bắt buộc role admin.
   */

  checkAdminRole(user);

  /**
   * Kiểm tra trạng thái.
   */

  checkUserStatus(user);

  return formatUser(user);
};


/**
 * =========================================================
 * 14. ADMIN REQUEST CHANGE EMAIL
 * =========================================================
 *
 * Admin đã đăng nhập.
 *
 * Input:
 *
 * newEmail
 *
 * Flow:
 *
 * Admin đăng nhập
 *       ↓
 * JWT
 *       ↓
 * Tìm admin
 *       ↓
 * Kiểm tra newEmail
 *       ↓
 * Email mới chưa được sử dụng
 *       ↓
 * Gửi OTP tới email mới
 *
 * CHƯA update email ở bước này.
 *
 * =========================================================
 */

export const adminRequestChangeEmail =
  async (
    userId: string,
    newEmail: string
  ): Promise<void> => {
    const normalizedNewEmail =
      normalizeEmail(newEmail);

    /**
     * -------------------------------------------------------
     * BƯỚC 1:
     * LẤY ADMIN
     * -------------------------------------------------------
     */

    const user =
      await User.findById(userId);

    if (!user) {
      throw new Error(
        "Không tìm thấy tài khoản admin."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 2:
     * KIỂM TRA ROLE
     * -------------------------------------------------------
     */

    checkAdminRole(user);

    /**
     * -------------------------------------------------------
     * BƯỚC 3:
     * KIỂM TRA STATUS
     * -------------------------------------------------------
     */

    checkUserStatus(user);

    /**
     * -------------------------------------------------------
     * BƯỚC 4:
     * EMAIL MỚI PHẢI KHÁC EMAIL HIỆN TẠI
     * -------------------------------------------------------
     */

    if (
      normalizedNewEmail ===
      normalizeEmail(user.email)
    ) {
      throw new Error(
        "Email mới phải khác email hiện tại."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 5:
     * KIỂM TRA EMAIL MỚI ĐÃ TỒN TẠI CHƯA
     * -------------------------------------------------------
     */

    const existingUser =
      await User.findOne({
        email: normalizedNewEmail,
      });

    if (existingUser) {
      throw new Error(
        "Email mới đã được sử dụng."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 6:
     * GỬI OTP TỚI EMAIL MỚI
     * -------------------------------------------------------
     *
     * OTP type:
     *
     * change_email
     *
     * =======================================================
     */

    await sendOtp(
      normalizedNewEmail,
      "change_email"
    );
  };


/**
 * =========================================================
 * 15. ADMIN VERIFY CHANGE EMAIL
 * =========================================================
 *
 * Input:
 *
 * - userId
 * - newEmail
 * - otp
 *
 * Flow:
 *
 * OTP
 *   ↓
 * Verify OTP
 *   ↓
 * Tìm admin
 *   ↓
 * Kiểm tra role
 *   ↓
 * Kiểm tra email mới
 *   ↓
 * Update email
 *   ↓
 * emailVerifiedAt = now
 *   ↓
 * Invalidate OTP
 *
 * =========================================================
 */

export const adminVerifyChangeEmail =
  async (
    userId: string,
    newEmail: string,
    otp: string
  ): Promise<
    ReturnType<typeof formatUser>
  > => {
    const normalizedNewEmail =
      normalizeEmail(newEmail);

    /**
     * -------------------------------------------------------
     * BƯỚC 1:
     * VERIFY OTP
     * -------------------------------------------------------
     */

    const otpValid =
      verifyOtpService(
        normalizedNewEmail,
        otp,
        "change_email"
      );

    if (!otpValid) {
      throw new Error(
        "OTP không hợp lệ hoặc đã hết hạn."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 2:
     * LẤY ADMIN
     * -------------------------------------------------------
     */

    const user =
      await User.findById(userId);

    if (!user) {
      invalidateOtpService(
        normalizedNewEmail,
        "change_email"
      );

      throw new Error(
        "Không tìm thấy tài khoản admin."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 3:
     * KIỂM TRA ROLE
     * -------------------------------------------------------
     */

    if (user.role !== "admin") {
      invalidateOtpService(
        normalizedNewEmail,
        "change_email"
      );

      throw new Error(
        "Tài khoản không có quyền quản trị."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 4:
     * KIỂM TRA STATUS
     * -------------------------------------------------------
     */

    try {
      checkUserStatus(user);
    } catch (error) {
      invalidateOtpService(
        normalizedNewEmail,
        "change_email"
      );

      throw error;
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 5:
     * EMAIL MỚI KHÔNG ĐƯỢC TRÙNG EMAIL HIỆN TẠI
     * -------------------------------------------------------
     */

    if (
      normalizeEmail(user.email) ===
      normalizedNewEmail
    ) {
      invalidateOtpService(
        normalizedNewEmail,
        "change_email"
      );

      throw new Error(
        "Email mới phải khác email hiện tại."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 6:
     * KIỂM TRA EMAIL MỚI CÓ BỊ USER KHÁC SỬ DỤNG KHÔNG
     * -------------------------------------------------------
     */

    const existingUser =
      await User.findOne({
        email: normalizedNewEmail,
        _id: {
          $ne: user._id,
        },
      });

    if (existingUser) {
      invalidateOtpService(
        normalizedNewEmail,
        "change_email"
      );

      throw new Error(
        "Email mới đã được sử dụng."
      );
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 7:
     * UPDATE EMAIL
     * -------------------------------------------------------
     */

    user.email =
      normalizedNewEmail;

    /**
     * Email mới đã được xác thực
     * bằng OTP.
     */

    user.emailVerifiedAt =
      new Date();

    await user.save();

    /**
     * -------------------------------------------------------
     * BƯỚC 8:
     * INVALIDATE OTP
     * -------------------------------------------------------
     */

    invalidateOtpService(
      normalizedNewEmail,
      "change_email"
    );

    /**
     * -------------------------------------------------------
     * BƯỚC 9:
     * TRẢ ADMIN MỚI
     * -------------------------------------------------------
     */

    return formatUser(user);
  };