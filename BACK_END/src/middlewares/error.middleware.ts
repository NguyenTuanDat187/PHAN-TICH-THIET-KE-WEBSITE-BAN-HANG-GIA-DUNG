
/**
 * =========================================================
 * FILE: BACK_END/src/middleware/error.middleware.ts
 * =========================================================
 *
 * Mục đích:
 * - Chuẩn hóa tất cả lỗi API thành JSON.
 * - Trả đúng HTTP status code.
 * - Không gửi stack trace cho client.
 * =========================================================
 */

import type {
  Request,
  Response,
  NextFunction,
} from "express";

interface AppError extends Error {
  statusCode?: number;
}

const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Nếu response đã được gửi, chuyển lỗi cho Express xử lý.
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode =
    typeof err.statusCode === "number" &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  // Chỉ ghi log chi tiết phía server đối với lỗi 500.
  if (statusCode >= 500) {
    console.error("Internal Server Error:", err);
  }

  const message =
    statusCode === 500
      ? "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau."
      : err.message || "Yêu cầu không hợp lệ.";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
