/**
 * FILE: BACK_END/src/routes/admin/admin.customer.routes.ts
 *
 * NHIỆM VỤ:
 * - Khai báo các API quản lý khách hàng.
 * - Bắt buộc đăng nhập.
 * - Chỉ cho phép admin truy cập.
 * - Chạy validator trước controller.
 */

import { Router } from "express";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import authMiddleware from "../../middlewares/auth.middleware";

import {
  getAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomerStatus,
} from "../../controllers/admin/admin.customer.controller";

import {
  getAdminCustomersValidator,
  getAdminCustomerByIdValidator,
  updateAdminCustomerStatusValidator,
  validateAdminCustomerRequest,
} from "../../validators/admin/admin.customer.validator";

const router = Router();

/**
 * Kiểm tra quyền admin.
 *
 * authMiddleware phải chạy trước để gắn req.user.
 */
const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập.",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện chức năng này.",
    });
    return;
  }

  next();
};

// Tất cả endpoint bên dưới đều yêu cầu admin.
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * GET /
 * Danh sách khách hàng có tìm kiếm, lọc, phân trang.
 */
router.get(
  "/",
  getAdminCustomersValidator,
  validateAdminCustomerRequest,
  getAdminCustomers
);

/**
 * PATCH /:id/status
 * Khóa, ngừng hoạt động hoặc khôi phục tài khoản.
 */
router.patch(
  "/:id/status",
  updateAdminCustomerStatusValidator,
  validateAdminCustomerRequest,
  updateAdminCustomerStatus
);

/**
 * GET /:id
 * Chi tiết một khách hàng.
 */
router.get(
  "/:id",
  getAdminCustomerByIdValidator,
  validateAdminCustomerRequest,
  getAdminCustomerById
);

export default router;