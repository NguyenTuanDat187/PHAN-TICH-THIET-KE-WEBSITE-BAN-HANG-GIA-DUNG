/**
 * =========================================================
 * FILE: BACK_END/src/middleware/validate.middleware.ts
 * =========================================================
 * Mục đích:
 * - Nhận kết quả validate từ express-validator
 * - Nếu có lỗi → trả HTTP 400
 * - Nếu hợp lệ → cho request đi tiếp vào Controller
 * =========================================================
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Lấy toàn bộ lỗi validation
  const errors = validationResult(req);

  // Nếu có lỗi
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : undefined,
        message: error.msg,
      })),
    });

    return;
  }

  // Không có lỗi → cho request đi tiếp
  next();
};

export default validate;