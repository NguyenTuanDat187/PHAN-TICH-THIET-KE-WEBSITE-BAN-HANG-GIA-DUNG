/**
 * =========================================================
 * FILE: BACK_END/src/services/statistics/admin.statistics.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Thống kê tổng số khách hàng.
 * - Thống kê khách hàng theo trạng thái.
 * - Thống kê tổng số tài khoản Admin.
 * - Thống kê số khách hàng mới trong tháng hiện tại.
 *
 * PHÂN QUYỀN:
 * - Chỉ dành cho Admin.
 * - Kiểm tra quyền tại tầng routes/middleware.
 *
 * LƯU Ý:
 * - Customer và Admin dùng chung model User.
 * - Không thống kê nhầm tài khoản Admin vào Customer.
 * - Không trả về thông tin nhạy cảm của người dùng.
 * =========================================================
 */

import { User } from "../../models";

/**
 * Thống kê tài khoản người dùng dành cho Admin.
 */
export const getAdminUserStatisticsService = async () => {
  // Lấy thời điểm đầu tháng hiện tại.
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  // Thời điểm đầu tháng tiếp theo.
  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  // Thực hiện các truy vấn song song để giảm thời gian chờ.
  const [
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    blockedCustomers,
    totalAdmins,
    newCustomersThisMonth,
  ] = await Promise.all([
    // Tổng số tài khoản Customer.
    User.countDocuments({
      role: "customer",
    }),

    // Customer đang hoạt động.
    User.countDocuments({
      role: "customer",
      status: "active",
    }),

    // Customer không hoạt động.
    User.countDocuments({
      role: "customer",
      status: "inactive",
    }),

    // Customer bị khóa.
    User.countDocuments({
      role: "customer",
      status: "blocked",
    }),

    // Tổng số tài khoản Admin.
    User.countDocuments({
      role: "admin",
    }),

    // Customer được tạo trong tháng hiện tại.
    User.countDocuments({
      role: "customer",
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    }),
  ]);

  return {
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
      blocked: blockedCustomers,
      newThisMonth: newCustomersThisMonth,
    },

    totalAdmins,

    period: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  };
};