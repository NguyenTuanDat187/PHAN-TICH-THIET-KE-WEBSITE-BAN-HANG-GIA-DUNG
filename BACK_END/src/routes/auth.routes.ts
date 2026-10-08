/**
 * =========================================================
 * FILE: BACK_END/src/routes/auth.routes.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Khai báo toàn bộ API liên quan đến Authentication
 * - Kết nối Validator
 * - Kết nối Middleware
 * - Kết nối Controller
 *
 * BAO GỒM:
 *
 * 1. Authentication dùng chung:
 *    - Register
 *    - Login
 *    - Forgot password
 *    - Reset password
 *    - Get current user
 *    - Change password
 *    - Logout
 *
 * 2. Authentication dành cho Admin:
 *    - Admin login
 *    - Admin forgot password
 *    - Admin reset password
 *    - Admin change password
 *    - Admin get current user
 *    - Admin request change email
 *    - Admin verify change email
 *
 * =========================================================
 */

import { Router } from "express";

/**
 * =========================================================
 * VALIDATOR
 * =========================================================
 */

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

/**
 * =========================================================
 * MIDDLEWARE
 * =========================================================
 */

import authMiddleware from "../middlewares/auth.middleware";

/**
 * =========================================================
 * CONTROLLER
 * =========================================================
 */

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

  // =======================================================
  // ADMIN AUTH
  // =======================================================

  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  adminChangePassword,
  adminGetCurrentUser,
  adminRequestChangeEmail,
  adminVerifyChangeEmail,
} from "../controllers/auth.controller";

/**
 * =========================================================
 * OTP CONTROLLER
 * =========================================================
 *
 * Dùng cho việc gửi OTP đổi email Admin.
 *
 * =========================================================
 */

import {
  requestChangeEmailOtp,
} from "../controllers/otp.controller";

/**
 * =========================================================
 * ROUTER
 * =========================================================
 */

const router = Router();

/**
 * =========================================================
 * ĐĂNG KÝ
 * =========================================================
 */

/**
 * Bước 1:
 * Người dùng nhập email → gửi OTP
 *
 * POST /api/auth/register/request-otp
 */

router.post(
  "/register/request-otp",
  requestRegisterOtpValidator,
  validate,
  requestRegisterOtp,
);

/**
 * Bước 2:
 * Người dùng nhập OTP
 *
 * POST /api/auth/register/verify-otp
 */

router.post(
  "/register/verify-otp",
  verifyRegisterOtpValidator,
  validate,
  verifyRegisterOtp,
);

/**
 * Bước 3:
 * Tạo tài khoản
 *
 * POST /api/auth/register
 */

router.post(
  "/register",
  registerValidator,
  validate,
  register,
);

/**
 * =========================================================
 * ĐĂNG NHẬP
 * =========================================================
 *
 * POST /api/auth/login
 *
 * API này vẫn giữ nguyên.
 *
 * =========================================================
 */

router.post(
  "/login",
  loginValidator,
  validate,
  login,
);

/**
 * =========================================================
 * QUÊN MẬT KHẨU
 * =========================================================
 *
 * POST /api/auth/forgot-password
 */

router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword,
);

/**
 * =========================================================
 * RESET PASSWORD
 * =========================================================
 *
 * POST /api/auth/reset-password
 */

router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  resetPassword,
);

/**
 * =========================================================
 * USER ĐÃ ĐĂNG NHẬP
 * =========================================================
 */

/**
 * Lấy thông tin User hiện tại
 *
 * GET /api/auth/me
 */

router.get(
  "/me",
  authMiddleware,
  getCurrentUser,
);

/**
 * Đổi mật khẩu User
 *
 * POST /api/auth/change-password
 */

router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  changePassword,
);

/**
 * Đăng xuất
 *
 * POST /api/auth/logout
 */

router.post(
  "/logout",
  authMiddleware,
  logout,
);

/**
 * =========================================================
 * =========================================================
 *                    ADMIN AUTH
 * =========================================================
 * =========================================================
 *
 * Admin vẫn sử dụng User Model.
 *
 * Phân biệt Admin bằng:
 *
 * role = "admin"
 *
 * Không tạo Admin Model riêng.
 *
 * =========================================================
 */

/**
 * =========================================================
 * 1. ADMIN LOGIN
 * =========================================================
 *
 * POST /api/auth/admin/login
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com",
 *   "password": "Admin@123456"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/admin/login",
  loginValidator,
  validate,
  adminLogin,
);

/**
 * =========================================================
 * 2. ADMIN FORGOT PASSWORD
 * =========================================================
 *
 * POST /api/auth/admin/forgot-password
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/admin/forgot-password",
  forgotPasswordValidator,
  validate,
  adminForgotPassword,
);

/**
 * =========================================================
 * 3. ADMIN RESET PASSWORD
 * =========================================================
 *
 * POST /api/auth/admin/reset-password
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com",
 *   "otp": "123456",
 *   "newPassword": "Admin@NewPassword123"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/admin/reset-password",
  resetPasswordValidator,
  validate,
  adminResetPassword,
);

/**
 * =========================================================
 * 4. ADMIN CHANGE PASSWORD
 * =========================================================
 *
 * POST /api/auth/admin/change-password
 *
 * Header:
 *
 * Authorization: Bearer <admin_token>
 *
 * Body:
 *
 * {
 *   "currentPassword": "Admin@123456",
 *   "newPassword": "Admin@NewPassword123"
 * }
 *
 * =========================================================
 */

router.post(
  "/admin/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  adminChangePassword,
);

/**
 * =========================================================
 * 5. ADMIN GET CURRENT USER
 * =========================================================
 *
 * GET /api/auth/admin/me
 *
 * Header:
 *
 * Authorization: Bearer <admin_token>
 *
 * =========================================================
 */

router.get(
  "/admin/me",
  authMiddleware,
  adminGetCurrentUser,
);

/**
 * =========================================================
 * 6. ADMIN REQUEST CHANGE EMAIL
 * =========================================================
 *
 * POST /api/auth/admin/change-email/request-otp
 *
 * Header:
 *
 * Authorization: Bearer <admin_token>
 *
 * Body:
 *
 * {
 *   "newEmail": "admin.new@gmail.com"
 * }
 *
 * =========================================================
 */

router.post(
  "/admin/change-email/request-otp",
  authMiddleware,
  requestChangeEmailOtp,
);

/**
 * =========================================================
 * 7. ADMIN VERIFY CHANGE EMAIL
 * =========================================================
 *
 * POST /api/auth/admin/change-email/verify
 *
 * Header:
 *
 * Authorization: Bearer <admin_token>
 *
 * Body:
 *
 * {
 *   "newEmail": "admin.new@gmail.com",
 *   "otp": "123456"
 * }
 *
 * =========================================================
 */

router.post(
  "/admin/change-email/verify",
  authMiddleware,
  adminVerifyChangeEmail,
);

/**
 * =========================================================
 * EXPORT ROUTER
 * =========================================================
 */

export default router;