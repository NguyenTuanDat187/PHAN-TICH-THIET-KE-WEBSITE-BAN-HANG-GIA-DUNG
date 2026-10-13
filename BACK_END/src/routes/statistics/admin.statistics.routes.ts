
/**
 * =========================================================
 * FILE: BACK_END/src/routes/statistics/admin.statistics.routes.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Định tuyến API thống kê User dành cho Admin.
 * - Xác thực JWT.
 * - Chỉ cho phép tài khoản Admin truy cập.
 * =========================================================
 */

import { Router, Request, Response, NextFunction } from "express";

import authMiddleware from "../../middlewares/auth.middleware";

import {
  getAdminUserStatistics,
} from "../../controllers/statistics/admin.statistics.controller";

const router = Router();

/**
 * Middleware kiểm tra quyền Admin.
 *
 * authMiddleware chạy trước để gắn req.user.
 */
const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập.",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập chức năng này.",
    });
    return;
  }

  next();
};

// Tất cả API trong router yêu cầu đăng nhập và quyền Admin.
router.use(authMiddleware);
router.use(requireAdmin);

// Thống kê User.
router.get("/users", getAdminUserStatistics);

export default router;
