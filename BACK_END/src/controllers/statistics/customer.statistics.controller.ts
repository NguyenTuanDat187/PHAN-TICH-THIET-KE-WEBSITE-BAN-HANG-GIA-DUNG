
/**
 * =========================================================
 * FILE: BACK_END/src/controllers/statistics/customer.statistics.controller.ts
 * =========================================================
 */

import { Request, Response, NextFunction } from "express";

import {
  getCustomerStatisticsService,
  getCustomerOrderStatisticsService,
  getCustomerReviewStatisticsService,
} from "../../services/statistics/customer.statistics.service";

/**
 * Lấy userId từ thông tin đã được authMiddleware xác thực.
 */
const getCustomerId = (req: Request): string => {
  const user = (req as any).user;

  if (!user?.userId) {
    throw new Error("Không xác định được tài khoản đang đăng nhập.");
  }

  if (user.role !== "customer") {
    throw new Error("Chỉ khách hàng mới được truy cập thống kê này.");
  }

  return user.userId;
};

/**
 * GET /overview
 */
export const getCustomerStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCustomerId(req);
    const data = await getCustomerStatisticsService(userId);

    res.status(200).json({
      success: true,
      message: "Lấy thống kê khách hàng thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /orders
 */
export const getCustomerOrderStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCustomerId(req);
    const data =
      await getCustomerOrderStatisticsService(userId);

    res.status(200).json({
      success: true,
      message: "Lấy thống kê đơn hàng thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /reviews
 */
export const getCustomerReviewStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCustomerId(req);
    const data =
      await getCustomerReviewStatisticsService(userId);

    res.status(200).json({
      success: true,
      message: "Lấy thống kê đánh giá thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};
