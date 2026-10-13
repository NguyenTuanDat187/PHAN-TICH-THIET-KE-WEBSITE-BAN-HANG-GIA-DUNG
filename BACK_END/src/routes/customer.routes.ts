/**
 * =========================================================
 * FILE: BACK_END/src/routes/customer.routes.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Khai báo API dành cho Customer.
 * - Kết nối Customer Validator.
 * - Kết nối Middleware xác thực và upload.
 * - Kết nối Customer Controller.
 *
 * LƯU Ý:
 * - Customer sử dụng User Model với role = "customer".
 * - Không cho Customer tự thay đổi role, status hoặc email.
 * - OTP đăng ký được xử lý thông qua các hàm của Customer.
 * - Không khai báo lại OTP service tại file routes.
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
  customerRequestRegisterOtpValidator,
  customerVerifyRegisterOtpValidator,
  customerRegisterValidator,
  customerLoginValidator,
  customerForgotPasswordValidator,
  customerResetPasswordValidator,
  customerChangePasswordValidator,
  customerUpdateProfileValidator,
} from "../validators/customer.validator";

import validate from "../middlewares/validate.middleware";

/**
 * =========================================================
 * MIDDLEWARE
 * =========================================================
 */

import authMiddleware from "../middlewares/auth.middleware";

// Đối chiếu export thực tế của file upload.middleware.ts.
// Nếu file của bạn export tên khác, cần sửa dòng import này.
import uploadMiddleware from "../middlewares/upload.middleware";

/**
 * =========================================================
 * CONTROLLER
 * =========================================================
 */

import {
  customerRequestRegisterOtp,
  customerVerifyRegisterOtp,
  customerRegister,
  customerLogin,
  customerForgotPassword,
  customerResetPassword,
  customerGetCurrentUser,
  customerChangePassword,
  customerUpdateProfile,
  customerLogout,
} from "../controllers/customer.controller";

/**
 * =========================================================
 * ROUTER
 * =========================================================
 */

const router = Router();

/**
 * =========================================================
 * 1. REQUEST OTP ĐĂNG KÝ
 * =========================================================
 *
 * POST /api/customer/register/request-otp
 *
 * Body:
 * {
 *   "email": "customer@gmail.com"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/register/request-otp",
  customerRequestRegisterOtpValidator,
  validate,
  customerRequestRegisterOtp,
);

/**
 * =========================================================
 * 2. VERIFY OTP ĐĂNG KÝ
 * =========================================================
 *
 * POST /api/customer/register/verify-otp
 *
 * Body:
 * {
 *   "email": "customer@gmail.com",
 *   "otp": "123456"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/register/verify-otp",
  customerVerifyRegisterOtpValidator,
  validate,
  customerVerifyRegisterOtp,
);

/**
 * =========================================================
 * 3. ĐĂNG KÝ CUSTOMER
 * =========================================================
 *
 * POST /api/customer/register
 *
 * Body:
 * {
 *   "email": "customer@gmail.com",
 *   "name": "Nguyen Van A",
 *   "phone": "0912345678",
 *   "password": "Customer@123"
 * }
 *
 * Email phải được xác minh OTP trước khi tạo tài khoản.
 *
 * =========================================================
 */

router.post(
  "/register",
  customerRegisterValidator,
  validate,
  customerRegister,
);

/**
 * =========================================================
 * 4. ĐĂNG NHẬP CUSTOMER
 * =========================================================
 *
 * POST /api/customer/login
 *
 * Body:
 * {
 *   "email": "customer@gmail.com",
 *   "password": "Customer@123"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/login",
  customerLoginValidator,
  validate,
  customerLogin,
);

/**
 * =========================================================
 * 5. QUÊN MẬT KHẨU
 * =========================================================
 *
 * POST /api/customer/forgot-password
 *
 * Body:
 * {
 *   "email": "customer@gmail.com"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/forgot-password",
  customerForgotPasswordValidator,
  validate,
  customerForgotPassword,
);

/**
 * =========================================================
 * 6. ĐẶT LẠI MẬT KHẨU
 * =========================================================
 *
 * POST /api/customer/reset-password
 *
 * Body:
 * {
 *   "email": "customer@gmail.com",
 *   "otp": "123456",
 *   "newPassword": "Customer@New123"
 * }
 *
 * Không cần JWT.
 *
 * =========================================================
 */

router.post(
  "/reset-password",
  customerResetPasswordValidator,
  validate,
  customerResetPassword,
);

/**
 * =========================================================
 * 7. LẤY THÔNG TIN CUSTOMER HIỆN TẠI
 * =========================================================
 *
 * GET /api/customer/me
 *
 * Header:
 * Authorization: Bearer <customer_token>
 *
 * =========================================================
 */

router.get(
  "/me",
  authMiddleware,
  customerGetCurrentUser,
);

/**
 * =========================================================
 * 8. ĐỔI MẬT KHẨU
 * =========================================================
 *
 * POST /api/customer/change-password
 *
 * Header:
 * Authorization: Bearer <customer_token>
 *
 * Body:
 * {
 *   "currentPassword": "Customer@123",
 *   "newPassword": "Customer@New123"
 * }
 *
 * =========================================================
 */

router.post(
  "/change-password",
  authMiddleware,
  customerChangePasswordValidator,
  validate,
  customerChangePassword,
);

/**
 * =========================================================
 * 9. CẬP NHẬT HỒ SƠ CUSTOMER
 * =========================================================
 *
 * PATCH /api/customer/profile
 *
 * Header:
 * Authorization: Bearer <customer_token>
 *
 * Có thể cập nhật:
 * - name
 * - phone
 * - avatar
 *
 * Không cho cập nhật email, password, role hoặc status.
 *
 * Nếu upload ảnh:
 * - Dùng multipart/form-data.
 * - Tên trường ảnh: avatar.
 *
 * =========================================================
 */

router.patch(
  "/profile",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  customerUpdateProfileValidator,
  validate,
  customerUpdateProfile,
);
/**
 * =========================================================
 * 10. ĐĂNG XUẤT
 * =========================================================
 *
 * POST /api/customer/logout
 *
 * Header:
 * Authorization: Bearer <customer_token>
 *
 * =========================================================
 */

router.post(
  "/logout",
  authMiddleware,
  customerLogout,
);

/**
 * =========================================================
 * EXPORT ROUTER
 * =========================================================
 */

export default router;