
/**
 * =========================================================
 * FILE: BACK_END/src/services/statistics/customer.statistics.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Thống kê dữ liệu của chính khách hàng đang đăng nhập.
 * - Thống kê đơn hàng theo trạng thái.
 * - Thống kê đánh giá và sản phẩm yêu thích.
 *
 * QUYỀN:
 * - Chỉ truy vấn dữ liệu theo userId đã xác thực.
 * - Không trả về thống kê của khách hàng khác.
 * =========================================================
 */

import {
  Order,
  ProductReview,
  Wishlist,
} from "../../models";

/**
 * Những trạng thái đơn hàng được tính vào tổng chi tiêu.
 *
 * LƯU Ý:
 * Đối chiếu các giá trị này với enum status thực tế
 * trong Order.model.ts của dự án.
 */
const COMPLETED_ORDER_STATUSES = [
  "delivered",
  "completed",
];

/**
 * Lấy thống kê tổng quan của khách hàng.
 */
export const getCustomerStatisticsService = async (
  userId: string,
) => {
  const [
    totalOrders,
    orderStatusStatistics,
    spendingResult,
    totalReviews,
    totalWishlistItems,
  ] = await Promise.all([
    // Tổng số đơn hàng của khách hàng.
    Order.countDocuments({ userId }),

    // Số lượng đơn hàng theo từng trạng thái.
    Order.aggregate([
      {
        $match: { userId: new (require("mongoose").Types.ObjectId)(userId) },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]),

    // Tổng chi tiêu từ các đơn đã hoàn thành.
    Order.aggregate([
      {
        $match: {
          userId: new (require("mongoose").Types.ObjectId)(userId),
          status: { $in: COMPLETED_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]),

    // Tổng số đánh giá của khách hàng.
    ProductReview.countDocuments({ userId }),

    // Số bản ghi yêu thích của khách hàng.
    Wishlist.countDocuments({ userId }),
  ]);

  return {
    totalOrders,
    ordersByStatus: orderStatusStatistics.map((item) => ({
      status: item._id,
      total: item.total,
    })),
    totalSpent: spendingResult[0]?.totalSpent ?? 0,
    totalReviews,
    totalWishlistItems,
  };
};

/**
 * Lấy thống kê đơn hàng riêng của khách hàng.
 */
export const getCustomerOrderStatisticsService = async (
  userId: string,
) => {
  const result = await Order.aggregate([
    {
      $match: {
        userId: new (require("mongoose").Types.ObjectId)(userId),
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  return {
    totalOrders: result.reduce(
      (total, item) => total + item.total,
      0,
    ),
    ordersByStatus: result.map((item) => ({
      status: item._id,
      total: item.total,
    })),
  };
};

/**
 * Lấy thống kê đánh giá của khách hàng.
 */
export const getCustomerReviewStatisticsService = async (
  userId: string,
) => {
  const totalReviews = await ProductReview.countDocuments({
    userId,
  });

  return {
    totalReviews,
  };
};