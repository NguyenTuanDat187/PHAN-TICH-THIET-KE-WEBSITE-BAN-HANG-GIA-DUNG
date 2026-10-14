
/**
 * =========================================================
 * FILE: BACK_END/src/routes/statistics/customer.statistics.routes.ts
 * =========================================================
 *
 * Prefix được đăng ký trong app.ts:
 * /api/customer/statistics
 * =========================================================
 */

import { Router, RequestHandler } from "express";

import authMiddleware from "../../middlewares/auth.middleware";

import {
  getCustomerStatistics,
  getCustomerOrderStatistics,
  getCustomerReviewStatistics,
} from "../../controllers/statistics/customer.statistics.controller";

const router = Router();

/**
 * Chặn tài khoản không phải customer.
 */
const requireCustomer: RequestHandler = (req, res, next) => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập.",
    });
    return;
  }

  if (user.role !== "customer") {
    res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập thống kê khách hàng.",
    });
    return;
  }

  next();
};

/**
 * Tất cả API trong router đều yêu cầu:
 * 1. JWT hợp lệ.
 * 2. Role customer.
 */
router.use(authMiddleware);
router.use(requireCustomer);

router.get("/overview", getCustomerStatistics);
router.get("/orders", getCustomerOrderStatistics);
router.get("/reviews", getCustomerReviewStatistics);

export default router;