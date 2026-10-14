
/**
 * FILE: BACK_END/src/services/admin.service.ts
 *
 * NHIỆM VỤ:
 * - Đăng nhập Admin.
 * - Quên mật khẩu, đặt lại mật khẩu, đổi mật khẩu.
 * - Lấy thông tin Admin hiện tại.
 * - Yêu cầu đổi email bằng OTP.
 * - Xác thực OTP và cập nhật email.
 * - Cập nhật hồ sơ Admin.
 *
 * LƯU Ý:
 * - Admin dùng chung User.model.ts.
 * - Phân quyền bằng role = "admin".
 * - Giữ nguyên OTP Service hiện tại.
 * - Không đọc req/res hoặc dùng express-validator tại Service.
 * - Không cho phép cập nhật role/status qua hồ sơ cá nhân.
 */

import bcrypt from "bcrypt";

import User, {
  IUser,
  UserStatus,
} from "../models/User.model";

import {
  invalidateOtpService,
  sendOtp,
  verifyOtpService,
} from "./otp.service";

import { generateToken } from "../utils/jwt";

const BCRYPT_SALT_ROUNDS = 12;

/** Thông tin Admin công khai. */
interface AdminPublicInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "admin";
  status: UserStatus;
  emailVerifiedAt: Date | null;
}

/** Kết quả đăng nhập Admin. */
interface AdminAuthResult {
  user: AdminPublicInfo;
  token: string;
}

/** Chuẩn hóa email trước khi thao tác Database. */
const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/** Chỉ trả thông tin được phép hiển thị cho Frontend. */
const formatAdmin = (user: IUser): AdminPublicInfo => {
  if (user.role !== "admin") {
    throw new Error("Tài khoản không có quyền quản trị.");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: "admin",
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
  };
};

/** Kiểm tra role Admin. */
const checkAdminRole = (user: IUser): void => {
  if (user.role !== "admin") {
    throw new Error("Bạn không có quyền truy cập chức năng quản trị.");
  }
};

/** Kiểm tra trạng thái tài khoản Admin. */
const checkAdminStatus = (user: IUser): void => {
  if (user.status === "blocked") {
    throw new Error("Tài khoản Admin đã bị khóa.");
  }

  if (user.status === "inactive") {
    throw new Error("Tài khoản Admin đang không hoạt động.");
  }
};

/** Kiểm tra cả quyền và trạng thái Admin. */
const checkActiveAdmin = (user: IUser): void => {
  checkAdminRole(user);
  checkAdminStatus(user);
};

/** Tạo JWT cho Admin. */
const generateAdminToken = (user: IUser): string =>
  generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

/**
 * 1. ĐĂNG NHẬP ADMIN
 *
 * Customer không thể sử dụng endpoint đăng nhập Admin.
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<AdminAuthResult> => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error(
      "Email hoặc mật khẩu Admin không chính xác."
    );
  }

  checkAdminRole(user);
  checkAdminStatus(user);

  const passwordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordCorrect) {
    throw new Error(
      "Email hoặc mật khẩu Admin không chính xác."
    );
  }

  return {
    user: formatAdmin(user),
    token: generateAdminToken(user),
  };
};

/**
 * 2. QUÊN MẬT KHẨU ADMIN
 *
 * Chỉ gửi OTP nếu email thuộc tài khoản Admin hợp lệ.
 */
export const adminForgotPassword = async (
  email: string
): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  checkActiveAdmin(user);

  await sendOtp(normalizedEmail, "reset_password");
};

/**
 * 3. ĐẶT LẠI MẬT KHẨU ADMIN
 *
 * OTP được xác thực bằng OTP Service hiện có.
 * Mật khẩu mới không được trùng mật khẩu cũ.
 */
export const adminResetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  const normalizedEmail = normalizeEmail(data.email);

  const otpValid = verifyOtpService(
    normalizedEmail,
    data.otp,
    "reset_password"
  );

  if (!otpValid) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    invalidateOtpService(normalizedEmail, "reset_password");
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  try {
    checkActiveAdmin(user);
  } catch (error) {
    invalidateOtpService(normalizedEmail, "reset_password");
    throw error;
  }

  const samePassword = await bcrypt.compare(
    data.newPassword,
    user.password
  );

  if (samePassword) {
    throw new Error(
      "Mật khẩu mới không được trùng với mật khẩu cũ."
    );
  }

  user.password = await bcrypt.hash(
    data.newPassword,
    BCRYPT_SALT_ROUNDS
  );

  await user.save();

  invalidateOtpService(normalizedEmail, "reset_password");
};

/**
 * 4. ĐỔI MẬT KHẨU ADMIN
 *
 * Admin đã đăng nhập, không cần OTP.
 * Bắt buộc nhập đúng mật khẩu hiện tại.
 */
export const adminChangePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  checkActiveAdmin(user);

  const currentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!currentPasswordCorrect) {
    throw new Error("Mật khẩu hiện tại không chính xác.");
  }

  const samePassword = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (samePassword) {
    throw new Error(
      "Mật khẩu mới không được trùng với mật khẩu cũ."
    );
  }

  user.password = await bcrypt.hash(
    newPassword,
    BCRYPT_SALT_ROUNDS
  );

  await user.save();
};

/**
 * 5. LẤY THÔNG TIN ADMIN HIỆN TẠI
 *
 * userId được lấy từ JWT qua Auth Middleware.
 */
export const adminGetCurrentUser = async (
  userId: string
): Promise<AdminPublicInfo> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  checkActiveAdmin(user);

  return formatAdmin(user);
};

/**
 * 6. YÊU CẦU ĐỔI EMAIL ADMIN
 *
 * Chỉ gửi OTP đến email mới.
 * Chưa cập nhật email trong Database ở bước này.
 */
export const adminRequestChangeEmail = async (
  userId: string,
  newEmail: string
): Promise<void> => {
  const normalizedNewEmail = normalizeEmail(newEmail);

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  checkActiveAdmin(user);

  if (normalizedNewEmail === normalizeEmail(user.email)) {
    throw new Error("Email mới phải khác email hiện tại.");
  }

  const existingUser = await User.findOne({
    email: normalizedNewEmail,
  });

  if (existingUser) {
    throw new Error("Email mới đã được sử dụng.");
  }

  // Gửi OTP theo email mới, gắn với userId Admin.
  await sendOtp(
    normalizedNewEmail,
    "change_email",
    userId
  );
};

/**
 * 7. XÁC THỰC OTP ĐỔI EMAIL ADMIN
 *
 * Xác thực OTP trước khi cập nhật email.
 * Kiểm tra lại email mới để tránh trường hợp email
 * bị tài khoản khác sử dụng trong lúc chờ OTP.
 */
export const adminVerifyChangeEmail = async (
  userId: string,
  newEmail: string,
  otp: string
): Promise<AdminPublicInfo> => {
  const normalizedNewEmail = normalizeEmail(newEmail);

  const otpValid = verifyOtpService(
    normalizedNewEmail,
    otp,
    "change_email",
    userId
  );

  if (!otpValid) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
  }

  const user = await User.findById(userId);

  if (!user) {
    invalidateOtpService(normalizedNewEmail, "change_email");
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  try {
    checkActiveAdmin(user);
  } catch (error) {
    invalidateOtpService(normalizedNewEmail, "change_email");
    throw error;
  }

  if (normalizeEmail(user.email) === normalizedNewEmail) {
    invalidateOtpService(normalizedNewEmail, "change_email");
    throw new Error("Email mới phải khác email hiện tại.");
  }

  const existingUser = await User.findOne({
    email: normalizedNewEmail,
    _id: { $ne: user._id },
  });

  if (existingUser) {
    invalidateOtpService(normalizedNewEmail, "change_email");
    throw new Error("Email mới đã được sử dụng.");
  }

  user.email = normalizedNewEmail;
  user.emailVerifiedAt = new Date();

  await user.save();

  invalidateOtpService(normalizedNewEmail, "change_email");

  return formatAdmin(user);
};

/**
 * 8. CẬP NHẬT HỒ SƠ ADMIN
 *
 * Chỉ cho phép cập nhật:
 * - name
 * - phone
 * - avatar
 *
 * Email phải sử dụng luồng OTP riêng.
 * Không cho phép cập nhật role/status/password ở đây.
 *
 * Avatar phải được upload middleware xử lý trước;
 * Controller truyền URL/đường dẫn avatar vào Service.
 */
export const adminUpdateProfile = async (
  userId: string,
  data: {
    name?: string;
    phone?: string | null;
    avatar?: string | null;
  }
): Promise<AdminPublicInfo> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản Admin.");
  }

  checkActiveAdmin(user);

  if (data.name !== undefined) {
    user.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    user.phone = data.phone?.trim() || null;
  }

  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
  }

  await user.save();

  return formatAdmin(user);
};
