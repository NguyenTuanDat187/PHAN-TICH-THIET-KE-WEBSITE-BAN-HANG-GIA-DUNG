/**
 * =========================================================
 * FILE: BACK_END/src/middleware/role.middleware.ts
 * =========================================================
 * Mục đích:
 * - Kiểm tra quyền của người dùng
 * - Phân quyền customer / admin
 * =========================================================
 */

import { Request, Response, NextFunction } from "express";

type UserRole = "customer" | "admin";

/**
 * Middleware kiểm tra role
 *
 * Ví dụ:
 * roleMiddleware("admin")
 *
 * → Chỉ admin được phép truy cập
 */
const roleMiddleware = (
  ...allowedRoles: UserRole[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Chưa đăng nhập
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });

      return;
    }

    // Kiểm tra role
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện chức năng này",
      });

      return;
    }

    next();
  };
};

export default roleMiddleware;