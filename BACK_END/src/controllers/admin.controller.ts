
/**
 * FILE: BACK_END/src/controllers/admin.controller.ts
 *
 * NHIỆM VỤ:
 * - Nhận HTTP Request từ Admin.
 * - Gọi admin.service.ts.
 * - Trả HTTP Response.
 *
 * CHỨC NĂNG:
 * - Đăng nhập Admin.
 * - Quên mật khẩu, đặt lại mật khẩu, đổi mật khẩu.
 * - Lấy thông tin Admin hiện tại.
 * - Yêu cầu và xác thực OTP đổi email.
 * - Cập nhật hồ sơ Admin.
 * - Đăng xuất Admin.
 *
 * LƯU Ý:
 * - Admin dùng chung User.model.ts.
 * - Phân quyền bằng role = "admin".
 * - Không truy vấn MongoDB trực tiếp.
 * - Không xử lý OTP hoặc mật khẩu trực tiếp.
 */

import { Request, Response } from "express";

import {
  adminLogin as adminLoginService,
  adminForgotPassword as adminForgotPasswordService,
  adminResetPassword as adminResetPasswordService,
  adminChangePassword as adminChangePasswordService,
  adminGetCurrentUser as adminGetCurrentUserService,
  adminRequestChangeEmail as adminRequestChangeEmailService,
  adminVerifyChangeEmail as adminVerifyChangeEmailService,
  adminUpdateProfile as adminUpdateProfileService,
} from "../services/admin.service";
import { uploadImageService } from "../services/upload.service";
/**
 * Request sau khi Auth Middleware xác thực JWT.
 */
type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: "customer" | "admin";
  };
};

/**
 * Lấy message lỗi an toàn.
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định.";
};

/**
 * Lấy userId và xác định đúng role Admin.
 *
 * Đây chỉ là kiểm tra bổ sung ở Controller.
 * Route vẫn phải có Auth Middleware.
 * Service cũng phải tự kiểm tra quyền Admin.
 */
const getAuthAdminId = (
  req: AuthenticatedRequest
): string | null => {
  if (req.user?.role !== "admin") {
    return null;
  }

  return req.user.userId;
};


/**
 * 1. ADMIN LOGIN
 *
 * POST /api/admin/auth/login
 */
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const result = await adminLoginService(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Admin thành công.",
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
 * 2. ADMIN FORGOT PASSWORD
 *
 * POST /api/admin/auth/forgot-password
 */
export const adminForgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    await adminForgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: "OTP đặt lại mật khẩu Admin đã được gửi đến email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 3. ADMIN RESET PASSWORD
 *
 * POST /api/admin/auth/reset-password
 *
 * confirmPassword do Validator kiểm tra.
 */
export const adminResetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp, newPassword } = req.body;

    await adminResetPasswordService({
      email,
      otp,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu Admin thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 4. ADMIN CHANGE PASSWORD
 *
 * POST /api/admin/auth/change-password
 *
 * Yêu cầu đăng nhập và đúng role Admin.
 */
export const adminChangePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthAdminId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng quản trị.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    await adminChangePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu Admin thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 5. ADMIN GET CURRENT USER
 *
 * GET /api/admin/auth/me
 *
 * Yêu cầu đăng nhập và đúng role Admin.
 */
export const adminGetCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthAdminId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng quản trị.",
      });
    }

    const user = await adminGetCurrentUserService(userId);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 6. ADMIN REQUEST CHANGE EMAIL
 *
 * POST /api/admin/auth/change-email/request-otp
 *
 * Gửi OTP đến email mới.
 * Email trong Database chưa thay đổi ở bước này.
 */
export const adminRequestChangeEmail = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthAdminId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng quản trị.",
      });
    }

    const { newEmail } = req.body;

    await adminRequestChangeEmailService(
      userId,
      newEmail
    );

    return res.status(200).json({
      success: true,
      message: "OTP xác nhận đổi email đã được gửi đến email mới.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 7. ADMIN VERIFY CHANGE EMAIL
 *
 * POST /api/admin/auth/change-email/verify-otp
 *
 * Xác thực OTP và cập nhật email Admin.
 */
export const adminVerifyChangeEmail = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthAdminId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng quản trị.",
      });
    }

    const { newEmail, otp } = req.body;

    const user = await adminVerifyChangeEmailService(
      userId,
      newEmail,
      otp
    );

    return res.status(200).json({
      success: true,
      message: "Đổi email Admin thành công.",
      data: { user },
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
 * 8. ADMIN UPDATE PROFILE
 * =========================================================
 *
 * PATCH /api/admin/profile
 *
 * CHỨC NĂNG:
 * - Cập nhật tên Admin.
 * - Cập nhật số điện thoại.
 * - Upload avatar lên Cloudinary.
 * - Lưu URL avatar vào MongoDB thông qua Service.
 *
 * LƯU Ý:
 * - Chỉ Admin đã đăng nhập mới được sử dụng.
 * - Không cập nhật email tại đây.
 * - Đổi email vẫn phải xác thực OTP riêng.
 * =========================================================
 */
export const adminUpdateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    // BƯỚC 1: Xác định Admin đang đăng nhập.
    const userId = getAuthAdminId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền truy cập chức năng quản trị.",
      });
    }

    // BƯỚC 2: Lấy thông tin được phép cập nhật.
    const { name, phone } = req.body;

    const data: {
      name?: string;
      phone?: string | null;
      avatar?: string | null;
    } = {};

    if (name !== undefined) {
      data.name = name;
    }

    if (phone !== undefined) {
      data.phone = phone;
    }

    // BƯỚC 3: Nếu có ảnh mới, upload lên Cloudinary.
    if (req.file) {
      const avatarUrl = await uploadImageService(
        req.file,
        "avatars/admins",
      );

      // Chỉ lưu URL ảnh, không lưu Buffer vào MongoDB.
      data.avatar = avatarUrl;
    }

    // BƯỚC 4: Gọi Service cập nhật hồ sơ Admin.
    const user = await adminUpdateProfileService(
      userId,
      data,
    );

    // BƯỚC 5: Trả về thông tin Admin và URL avatar.
    return res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ Admin thành công.",
      data: { user },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};


/**
 * 9. ADMIN LOGOUT
 *
 * POST /api/admin/auth/logout
 *
 * Với JWT stateless, Frontend xóa token.
 * Nếu dùng refresh token, bổ sung logic thu hồi token.
 */
export const adminLogout = (
  _req: Request,
  res: Response
): Response => {
  return res.status(200).json({
    success: true,
    message: "Đăng xuất Admin thành công.",
  });
};
