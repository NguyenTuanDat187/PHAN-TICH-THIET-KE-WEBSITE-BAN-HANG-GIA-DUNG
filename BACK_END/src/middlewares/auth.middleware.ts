/**
 * =========================================================
 * FILE: BACK_END/src/middleware/auth.middleware.ts
 * =========================================================
 * Mục đích:
 * - Kiểm tra JWT từ Authorization Header
 * - Xác thực người dùng
 * - Gắn thông tin user vào req.user
 * =========================================================
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

/**
 * Mở rộng Request của Express
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "customer" | "admin";
      };
    }
  }
}

/**
 * Middleware xác thực đăng nhập
 */
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Lấy Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });

      return;
    }

    // Authorization phải có dạng:
    // Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization không hợp lệ",
      });

      return;
    }

    // Lấy token
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token không tồn tại",
      });

      return;
    }

    // Verify JWT
    const decoded = verifyToken(token);

    // Gắn user vào request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Cho request đi tiếp
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

export default authMiddleware;