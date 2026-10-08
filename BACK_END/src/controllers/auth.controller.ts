/**
 * =========================================================
 * FILE: BACK_END/src/controllers/auth.controller.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Nhận HTTP Request.
 * - Gọi Auth Service.
 * - Trả HTTP Response.
 *
 * Controller KHÔNG:
 * - Truy vấn MongoDB trực tiếp.
 * - Hash password.
 * - Verify password.
 * - Tạo OTP.
 * - Tạo JWT.
 *
 * Những phần trên thuộc Service / OTP Controller.
 *
 * =========================================================
 */

import { Request, Response } from "express";

import {
  requestRegisterOtp as requestRegisterOtpService,
  verifyRegisterOtp as verifyRegisterOtpService,
  register as registerService,
  login as loginService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  getCurrentUser as getCurrentUserService,
  changePassword as changePasswordService,
} from "../services/auth.service";

/**
 * =========================================================
 * HELPER: ERROR MESSAGE
 * =========================================================
 *
 * Lấy message từ Error an toàn.
 */
const getErrorMessage = (
  error: unknown,
): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định.";
};

/**
 * =========================================================
 * 1. REQUEST REGISTER OTP
 * =========================================================
 *
 * POST /api/auth/register/request-otp
 *
 * Body:
 * {
 *   "email": "example@gmail.com"
 * }
 *
 * Flow:
 *
 * Email
 *   ↓
 * Validator
 *   ↓
 * Controller
 *   ↓
 * Service
 *   ↓
 * Kiểm tra email
 *   ↓
 * Gửi OTP
 */
export const requestRegisterOtp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.body;

    await requestRegisterOtpService(
      email,
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP đăng ký đã được gửi đến email của bạn.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 2. VERIFY REGISTER OTP
 * =========================================================
 *
 * POST /api/auth/register/verify-otp
 *
 * Body:
 * {
 *   "email": "example@gmail.com",
 *   "otp": "123456"
 * }
 *
 * OTP đúng:
 *
 * → Email được đánh dấu verified.
 * → Frontend được phép chuyển sang form thông tin.
 */
export const verifyRegisterOtp = (
  req: Request,
  res: Response,
): Response => {
  try {
    const {
      email,
      otp,
    } = req.body;

    verifyRegisterOtpService(
      email,
      otp,
    );

    return res.status(200).json({
      success: true,
      message:
        "Xác thực OTP thành công. Bạn có thể tiếp tục đăng ký.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 3. REGISTER
 * =========================================================
 *
 * POST /api/auth/register
 *
 * Body:
 *
 * {
 *   "email": "example@gmail.com",
 *   "name": "Nguyễn Tuấn Đạt",
 *   "phone": "0900000000",
 *   "password": "Password@123",
 *   "confirmPassword": "Password@123"
 * }
 *
 * Điều kiện:
 *
 * Email PHẢI verify OTP trước.
 */
export const register = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      email,
      name,
      phone,
      password,
    } = req.body;

    const result =
      await registerService({
        email,
        name,
        phone,
        password,
      });

    return res.status(201).json({
      success: true,
      message:
        "Đăng ký tài khoản thành công.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 4. LOGIN
 * =========================================================
 *
 * POST /api/auth/login
 *
 * Body:
 *
 * {
 *   "email": "example@gmail.com",
 *   "password": "Password@123"
 * }
 *
 * Customer và Admin dùng chung API.
 *
 * Role nằm trong:
 *
 * user.role
 */
export const login = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result =
      await loginService(
        email,
        password,
      );

    return res.status(200).json({
      success: true,
      message:
        "Đăng nhập thành công.",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 5. FORGOT PASSWORD
 * =========================================================
 *
 * POST /api/auth/forgot-password
 *
 * Body:
 *
 * {
 *   "email": "example@gmail.com"
 * }
 *
 * Áp dụng cho:
 * - Customer
 * - Admin
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.body;

    await forgotPasswordService(
      email,
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP đặt lại mật khẩu đã được gửi đến email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 6. RESET PASSWORD
 * =========================================================
 *
 * POST /api/auth/reset-password
 *
 * Body:
 *
 * {
 *   "email": "example@gmail.com",
 *   "otp": "123456",
 *   "newPassword": "NewPassword@123",
 *   "confirmPassword": "NewPassword@123"
 * }
 *
 * Service sẽ:
 * - Verify OTP.
 * - Check User.
 * - Check password cũ.
 * - Đảm bảo password mới khác password cũ.
 * - Hash password.
 * - Update MongoDB.
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    await resetPasswordService({
      email,
      otp,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Đặt lại mật khẩu thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 7. GET CURRENT USER
 * =========================================================
 *
 * GET /api/auth/me
 *
 * Route này sẽ được bảo vệ bởi:
 *
 * auth.middleware.ts
 *
 * Middleware sẽ đưa userId vào req.user.
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    /**
     * req.user sẽ được tạo bởi auth middleware.
     *
     * Tạm thời lấy kiểu any ở đây.
     *
     * Sau khi tạo auth.middleware.ts,
     * chúng ta sẽ khai báo TypeScript type chính xác
     * cho Express Request.
     */
    const userId = (
      req as Request & {
        user?: {
          userId: string;
          role: string;
        };
      }
    ).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Bạn chưa đăng nhập.",
      });
    }

    const user =
      await getCurrentUserService(
        userId,
      );

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 8. CHANGE PASSWORD
 * =========================================================
 *
 * POST /api/auth/change-password
 *
 * Route yêu cầu đăng nhập.
 *
 * Body:
 *
 * {
 *   "currentPassword": "OldPassword@123",
 *   "newPassword": "NewPassword@123",
 *   "confirmPassword": "NewPassword@123"
 * }
 */
export const changePassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = (
      req as Request & {
        user?: {
          userId: string;
          role: string;
        };
      }
    ).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Bạn chưa đăng nhập.",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    await changePasswordService(
      userId,
      currentPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message:
        "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * =========================================================
 * 9. LOGOUT
 * =========================================================
 *
 * Với JWT stateless:
 *
 * Backend không cần xóa JWT trên server.
 *
 * Frontend sẽ xóa token khỏi:
 * - localStorage
 * hoặc
 * - cookie
 *
 * Nếu sau này sử dụng refresh token thì logout sẽ có
 * thêm logic revoke refresh token.
 */
export const logout = (
  _req: Request,
  res: Response,
): Response => {
  return res.status(200).json({
    success: true,
    message:
      "Đăng xuất thành công.",
  });
};