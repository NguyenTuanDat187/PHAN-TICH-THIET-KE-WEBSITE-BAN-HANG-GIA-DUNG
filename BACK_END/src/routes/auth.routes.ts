/**
 * =========================================================
 * FILE: BACK_END/src/routes/auth.routes.ts
 * =========================================================
 * Mục đích:
 * - Khai báo toàn bộ API liên quan đến Authentication
 * - Kết nối Validator
 * - Kết nối Middleware
 * - Kết nối Controller
 * =========================================================
 */

import { Router } from "express";

import {
  requestRegisterOtpValidator,
  verifyRegisterOtpValidator,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "../validators/auth.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";

import {
  requestRegisterOtp,
  verifyRegisterOtp,
  register,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
  logout,
} from "../controllers/auth.controller";

const router = Router();

/**
 * =========================================================
 * ĐĂNG KÝ
 * =========================================================
 */

/**
 * Bước 1:
 * Người dùng nhập email
 * → Kiểm tra email
 * → Gửi OTP
 */
router.post(
  "/register/request-otp",
  requestRegisterOtpValidator,
  validate,
  requestRegisterOtp
);

/**
 * Bước 2:
 * Người dùng nhập OTP
 */
router.post(
  "/register/verify-otp",
  verifyRegisterOtpValidator,
  validate,
  verifyRegisterOtp
);

/**
 * Bước 3:
 * Sau khi OTP đúng
 * → nhập thông tin tài khoản
 * → tạo User
 */
router.post(
  "/register",
  registerValidator,
  validate,
  register
);

/**
 * =========================================================
 * ĐĂNG NHẬP
 * =========================================================
 */

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

/**
 * =========================================================
 * QUÊN MẬT KHẨU
 * =========================================================
 */

/**
 * Gửi OTP reset password
 */
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword
);

/**
 * Reset password
 */
router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  resetPassword
);

/**
 * =========================================================
 * USER ĐÃ ĐĂNG NHẬP
 * =========================================================
 */

/**
 * Lấy thông tin user hiện tại
 */
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

/**
 * Đổi mật khẩu
 */
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  changePassword
);

/**
 * Đăng xuất
 */
router.post(
  "/logout",
  authMiddleware,
  logout
);

export default router;