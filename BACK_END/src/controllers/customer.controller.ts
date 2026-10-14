
/**
 * FILE: BACK_END/src/controllers/customer.controller.ts
 *
 * NHIỆM VỤ:
 * - Nhận HTTP Request từ Customer.
 * - Gọi customer.service.ts.
 * - Trả HTTP Response.
 *
 * KHÔNG XỬ LÝ TẠI CONTROLLER:
 * - Truy vấn MongoDB trực tiếp.
 * - Hash hoặc so sánh mật khẩu.
 * - Tạo, gửi hoặc xác thực OTP.
 * - Tạo JWT.
 *
 * VALIDATOR:
 * - Kiểm tra dữ liệu đầu vào trước Controller.
 *
 * MIDDLEWARE:
 * - Auth Middleware cho các chức năng cần đăng nhập.
 * - Upload Middleware cho chức năng cập nhật avatar.
 */

import { Request, Response } from "express";

import {
  customerRequestRegisterOtp as customerRequestRegisterOtpService,
  customerVerifyRegisterOtp as customerVerifyRegisterOtpService,
  customerRegister as customerRegisterService,
  customerLogin as customerLoginService,
  customerForgotPassword as customerForgotPasswordService,
  customerResetPassword as customerResetPasswordService,
  customerGetCurrentUser as customerGetCurrentUserService,
  customerChangePassword as customerChangePasswordService,
  customerUpdateProfile as customerUpdateProfileService,
} from "../services/customer.service";
import { uploadImageService } from "../services/upload.service";


/**
 * Request có thông tin user sau khi Auth Middleware chạy.
 */
type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: "customer" | "admin";
  };
};

/**
 * Kiểu file được Upload Middleware xử lý.
 *
 * Nếu dự án dùng Cloudinary hoặc dịch vụ lưu ảnh khác,
 * điều chỉnh phần lấy URL ảnh cho đúng middleware hiện tại.
 */
type UploadedRequest = Request & {
  file?: {
    path?: string;
    filename?: string;
    secure_url?: string;
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
 * Lấy userId từ Auth Middleware.
 */
const getAuthUserId = (
  req: AuthenticatedRequest
): string | null => {
  if (req.user?.role !== "customer") {
    return null;
  }

  return req.user.userId;
};

/**
 * Lấy URL/đường dẫn ảnh từ Upload Middleware.
 *
 * Ưu tiên secure_url cho upload Cloudinary,
 * sau đó path hoặc filename tùy cấu hình Multer.
 */
const getUploadedAvatar = (
  req: UploadedRequest
): string | undefined => {
  if (!req.file) {
    return undefined;
  }

  return (
    req.file.secure_url ??
    req.file.path ??
    req.file.filename
  );
};

/**
 * 1. CUSTOMER REQUEST REGISTER OTP
 *
 * POST /api/customer/auth/register/request-otp
 */
export const customerRequestRegisterOtp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    await customerRequestRegisterOtpService(email);

    return res.status(200).json({
      success: true,
      message: "OTP đăng ký đã được gửi đến email của bạn.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 2. CUSTOMER VERIFY REGISTER OTP
 *
 * POST /api/customer/auth/register/verify-otp
 */
export const customerVerifyRegisterOtp = (
  req: Request,
  res: Response
): Response => {
  try {
    const { email, otp } = req.body;

    customerVerifyRegisterOtpService(email, otp);

    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công. Bạn có thể tiếp tục đăng ký.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 3. CUSTOMER REGISTER
 *
 * POST /api/customer/auth/register
 *
 * confirmPassword do Validator kiểm tra.
 * Không truyền confirmPassword xuống Service.
 */
export const customerRegister = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, name, phone, password } = req.body;

    const result = await customerRegisterService({
      email,
      name,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản Customer thành công.",
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
 * 4. CUSTOMER LOGIN
 *
 * POST /api/customer/auth/login
 */
export const customerLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const result = await customerLoginService(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Customer thành công.",
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
 * 5. CUSTOMER FORGOT PASSWORD
 *
 * POST /api/customer/auth/forgot-password
 */
export const customerForgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    await customerForgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: "OTP đặt lại mật khẩu đã được gửi đến email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 6. CUSTOMER RESET PASSWORD
 *
 * POST /api/customer/auth/reset-password
 *
 * confirmPassword do Validator kiểm tra.
 */
export const customerResetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp, newPassword } = req.body;

    await customerResetPasswordService({
      email,
      otp,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu Customer thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 7. CUSTOMER GET CURRENT USER
 *
 * GET /api/customer/auth/me
 *
 * Yêu cầu đăng nhập.
 */
export const customerGetCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập hoặc không có quyền Customer.",
      });
    }

    const user = await customerGetCurrentUserService(userId);

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
 * 8. CUSTOMER CHANGE PASSWORD
 *
 * POST /api/customer/auth/change-password
 *
 * Yêu cầu đăng nhập.
 */
export const customerChangePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập hoặc không có quyền Customer.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    await customerChangePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu Customer thành công.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * 9. CUSTOMER UPDATE PROFILE
 *
 * PATCH /api/customer/profile
 *
 * Cho phép:
 * - name
 * - phone
 * - avatar thông qua Upload Middleware
 *
 * Không cho phép cập nhật email, password, role, status.
 */

/**
 * =========================================================
 * 9. CUSTOMER UPDATE PROFILE
 * =========================================================
 *
 * PATCH /api/customer/profile
 *
 * CHỨC NĂNG:
 * - Cập nhật tên.
 * - Cập nhật số điện thoại.
 * - Upload avatar lên Cloudinary.
 * - Lưu URL avatar vào MongoDB thông qua Service.
 *
 * YÊU CẦU:
 * - Customer phải đăng nhập.
 * - Route phải sử dụng uploadMiddleware.single("avatar").
 * - Validator chạy trước Controller.
 * =========================================================
 */
export const customerUpdateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    // BƯỚC 1: Kiểm tra tài khoản đăng nhập.
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Bạn chưa đăng nhập hoặc không có quyền Customer.",
      });
    }

    // BƯỚC 2: Lấy dữ liệu cập nhật.
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
        "avatars/customers",
      );

      // Chỉ lưu URL ảnh, không lưu Buffer vào MongoDB.
      data.avatar = avatarUrl;
    }

    // BƯỚC 4: Gọi Service cập nhật hồ sơ.
    // Service chịu trách nhiệm cập nhật dữ liệu trong MongoDB.
    const user = await customerUpdateProfileService(
      userId,
      data,
    );

    // BƯỚC 5: Trả thông tin tài khoản cùng URL avatar.
    return res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ Customer thành công.",
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
 * 10. CUSTOMER LOGOUT
 *
 * POST /api/customer/auth/logout
 *
 * Với JWT stateless, Frontend xóa token.
 * Nếu sau này dùng refresh token, bổ sung revoke token.
 */
export const customerLogout = (
  _req: Request,
  res: Response
): Response => {
  return res.status(200).json({
    success: true,
    message: "Đăng xuất Customer thành công.",
  });
};
