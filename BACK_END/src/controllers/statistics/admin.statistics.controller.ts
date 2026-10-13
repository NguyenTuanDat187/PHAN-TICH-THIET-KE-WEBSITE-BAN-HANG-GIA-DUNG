/**
 * =========================================================
 * FILE: BACK_END/src/controllers/statistics/admin.statistics.controller.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Nhận request thống kê User.
 * - Gọi service xử lý dữ liệu.
 * - Trả response JSON cho client.
 * =========================================================
 */

import type { Request, Response, NextFunction } from "express";

import {
  getAdminUserStatisticsService,
} from "../../services/statistics/admin.statistics.service";

/**
 * GET /api/admin/statistics/users
 *
 * Thống kê số lượng Customer và Admin.
 */
export const getAdminUserStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getAdminUserStatisticsService();

    res.status(200).json({
      success: true,
      message: "Lấy thống kê người dùng thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};