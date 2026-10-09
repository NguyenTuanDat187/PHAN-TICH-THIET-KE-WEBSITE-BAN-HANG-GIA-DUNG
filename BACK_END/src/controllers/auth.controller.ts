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
 * CONTROLLER KHÔNG:
 * - Truy vấn MongoDB trực tiếp.
 * - Hash password.
 * - Verify password.
 * - Tạo OTP.
 * - Tạo JWT.
 *
 * Những phần trên thuộc Service / OTP Service / JWT Utils.
 *
 * =========================================================
 */

import { Request, Response } from "express";

import {
  // =======================================================
  // CUSTOMER AUTH
  // =======================================================

  requestRegisterOtp as requestRegisterOtpService,

  verifyRegisterOtp as verifyRegisterOtpService,

  register as registerService,

  login as loginService,

  forgotPassword as forgotPasswordService,

  resetPassword as resetPasswordService,

  getCurrentUser as getCurrentUserService,

  changePassword as changePasswordService,

  // =======================================================
  // ADMIN AUTH
  // =======================================================

  adminLogin as adminLoginService,

  adminForgotPassword as adminForgotPasswordService,

  adminResetPassword as adminResetPasswordService,

  adminChangePassword as adminChangePasswordService,

  adminGetCurrentUser as adminGetCurrentUserService,

  adminRequestChangeEmail as adminRequestChangeEmailService,

  adminVerifyChangeEmail as adminVerifyChangeEmailService,

} from "../services/auth.service";

/**
 * =========================================================
 * TYPE: AUTHENTICATED REQUEST
 * =========================================================
 *
 * Sau khi auth.middleware.ts chạy:
 *
 * req.user = {
 *   userId: string,
 *   role: "customer" | "admin"
 * }
 *
 * Tạm thời khai báo type tại Controller.
 *
 * Sau này có thể chuyển sang:
 *
 * express.d.ts
 *
 * để mở rộng Express Request toàn project.
 *
 * =========================================================
 */

type AuthenticatedRequest =
  Request & {
    user?: {
      userId: string;
      role: "customer" | "admin";
    };
  };

/**
 * =========================================================
 * HELPER: ERROR MESSAGE
 * =========================================================
 *
 * Lấy message từ Error an toàn.
 *
 * =========================================================
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
 * HELPER: GET AUTH USER
 * =========================================================
 *
 * Lấy userId từ req.user.
 *
 * Nếu chưa đăng nhập:
 *
 * → Controller trả 401.
 *
 * =========================================================
 */

const getAuthUserId = (
  req: AuthenticatedRequest,
): string | null => {
  return req.user?.userId ?? null;
};

/**
 * =========================================================
 * 1. REQUEST REGISTER OTP
 * =========================================================
 *
 * POST /api/auth/register/request-otp
 *
 * Body:
 *
 * {
 *   "email": "example@gmail.com"
 * }
 *
 * =========================================================
 */

export const requestRegisterOtp =
  async (
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

        message:
          getErrorMessage(error),
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
 *
 * {
 *   "email": "example@gmail.com",
 *   "otp": "123456"
 * }
 *
 * =========================================================
 */

export const verifyRegisterOtp =
  (
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

        message:
          getErrorMessage(error),
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
 * confirmPassword được Validator kiểm tra.
 *
 * Controller chỉ truyền password xuống Service.
 *
 * =========================================================
 */

export const register =
  async (
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

        message:
          getErrorMessage(error),
      });
    }
  };

/**
 * =========================================================
 * 4. LOGIN CUSTOMER
 * =========================================================
 *
 * POST /api/auth/login
 *
 * Customer và Admin có thể dùng login chung nếu muốn.
 *
 * Tuy nhiên Admin cũng có endpoint riêng:
 *
 * POST /api/admin/auth/login
 *
 * =========================================================
 */

export const login =
  async (
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

        message:
          getErrorMessage(error),
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
 * Dành cho customer.
 *
 * Admin có endpoint riêng:
 *
 * POST /api/admin/auth/forgot-password
 *
 * =========================================================
 */

export const forgotPassword =
  async (
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

        message:
          getErrorMessage(error),
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
 * =========================================================
 */

export const resetPassword =
  async (
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

        message:
          getErrorMessage(error),
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
 * Route yêu cầu đăng nhập.
 *
 * Middleware:
 *
 * JWT
 *  ↓
 * req.user
 *  ↓
 * Controller
 *  ↓
 * Service
 *
 * =========================================================
 */

export const getCurrentUser =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

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

        message:
          getErrorMessage(error),
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
 * =========================================================
 */

export const changePassword =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

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

        message:
          getErrorMessage(error),
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
 * Backend không cần xóa JWT.
 *
 * Frontend xóa token:
 *
 * - localStorage
 * hoặc
 * - cookie
 *
 * Nếu sau này sử dụng refresh token:
 *
 * → Có thể revoke refresh token.
 *
 * =========================================================
 */

export const logout =
  (
    _req: Request,
    res: Response,
  ): Response => {
    return res.status(200).json({
      success: true,

      message:
        "Đăng xuất thành công.",
    });
  };

/**
 * =========================================================
 * =========================================================
 *
 *                    ADMIN AUTH
 *
 * =========================================================
 * =========================================================
 *
 * Admin dùng chung User.model.
 *
 * Điều kiện:
 *
 * user.role === "admin"
 *
 * =========================================================
 */


/**
 * =========================================================
 * 10. ADMIN LOGIN
 * =========================================================
 *
 * POST /api/admin/auth/login
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com",
 *   "password": "Admin@123"
 * }
 *
 * =========================================================
 */

export const adminLogin =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const {
        email,
        password,
      } = req.body;

      const result =
        await adminLoginService(
          email,
          password,
        );

      return res.status(200).json({
        success: true,

        message:
          "Đăng nhập admin thành công.",

        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 11. ADMIN FORGOT PASSWORD
 * =========================================================
 *
 * POST /api/admin/auth/forgot-password
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com"
 * }
 *
 * Flow:
 *
 * Admin email
 *      ↓
 * Controller
 *      ↓
 * Service
 *      ↓
 * Check role = admin
 *      ↓
 * Send OTP
 *
 * =========================================================
 */

export const adminForgotPassword =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { email } = req.body;

      await adminForgotPasswordService(
        email,
      );

      return res.status(200).json({
        success: true,

        message:
          "OTP đặt lại mật khẩu admin đã được gửi đến email.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 12. ADMIN RESET PASSWORD
 * =========================================================
 *
 * POST /api/admin/auth/reset-password
 *
 * Body:
 *
 * {
 *   "email": "admin@gmail.com",
 *   "otp": "123456",
 *   "newPassword": "NewAdmin@123",
 *   "confirmPassword": "NewAdmin@123"
 * }
 *
 * =========================================================
 */

export const adminResetPassword =
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      await adminResetPasswordService({
        email,
        otp,
        newPassword,
      });

      return res.status(200).json({
        success: true,

        message:
          "Đặt lại mật khẩu admin thành công.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 13. ADMIN CHANGE PASSWORD
 * =========================================================
 *
 * POST /api/admin/auth/change-password
 *
 * Route:
 *
 * - Phải đăng nhập.
 * - Phải có JWT.
 * - JWT role phải là admin.
 *
 * Body:
 *
 * {
 *   "currentPassword": "OldAdmin@123",
 *   "newPassword": "NewAdmin@123",
 *   "confirmPassword": "NewAdmin@123"
 * }
 *
 * =========================================================
 */

export const adminChangePassword =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Bạn chưa đăng nhập.",
        });
      }

      /**
       * Controller có thể kiểm tra role
       * để trả lỗi sớm.
       *
       * Service vẫn phải kiểm tra lại.
       */

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,

          message:
            "Bạn không có quyền truy cập chức năng quản trị.",
        });
      }

      const {
        currentPassword,
        newPassword,
      } = req.body;

      await adminChangePasswordService(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        success: true,

        message:
          "Đổi mật khẩu admin thành công.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 14. ADMIN GET CURRENT USER
 * =========================================================
 *
 * GET /api/admin/auth/me
 *
 * Route:
 *
 * - JWT middleware.
 * - Admin middleware.
 *
 * Service vẫn kiểm tra role admin lần nữa.
 *
 * =========================================================
 */

export const adminGetCurrentUser =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Bạn chưa đăng nhập.",
        });
      }

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,

          message:
            "Bạn không có quyền truy cập chức năng quản trị.",
        });
      }

      const user =
        await adminGetCurrentUserService(
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

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 15. ADMIN REQUEST CHANGE EMAIL
 * =========================================================
 *
 * POST /api/admin/auth/change-email/request-otp
 *
 * Body:
 *
 * {
 *   "newEmail": "newadmin@gmail.com"
 * }
 *
 * Flow:
 *
 * JWT
 *  ↓
 * Admin
 *  ↓
 * Nhập email mới
 *  ↓
 * Kiểm tra email
 *  ↓
 * Gửi OTP email mới
 *
 * Email DATABASE CHƯA thay đổi ở bước này.
 *
 * =========================================================
 */

export const adminRequestChangeEmail =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Bạn chưa đăng nhập.",
        });
      }

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,

          message:
            "Bạn không có quyền truy cập chức năng quản trị.",
        });
      }

      const {
        newEmail,
      } = req.body;

      await adminRequestChangeEmailService(
        userId,
        newEmail,
      );

      return res.status(200).json({
        success: true,

        message:
          "OTP xác nhận đổi email đã được gửi đến email mới.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };


/**
 * =========================================================
 * 16. ADMIN VERIFY CHANGE EMAIL
 * =========================================================
 *
 * POST /api/admin/auth/change-email/verify-otp
 *
 * Body:
 *
 * {
 *   "newEmail": "newadmin@gmail.com",
 *   "otp": "123456"
 * }
 *
 * Flow:
 *
 * JWT
 *  ↓
 * Admin
 *  ↓
 * Verify OTP
 *  ↓
 * Check email
 *  ↓
 * Update email
 *
 * =========================================================
 */

export const adminVerifyChangeEmail =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Bạn chưa đăng nhập.",
        });
      }

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,

          message:
            "Bạn không có quyền truy cập chức năng quản trị.",
        });
      }

      const {
        newEmail,
        otp,
      } = req.body;

      const user =
        await adminVerifyChangeEmailService(
          userId,
          newEmail,
          otp,
        );

      return res.status(200).json({
        success: true,

        message:
          "Đổi email admin thành công.",

        data: {
          user,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          getErrorMessage(error),
      });
    }
  };