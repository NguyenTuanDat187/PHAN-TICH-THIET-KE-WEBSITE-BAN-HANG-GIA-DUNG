/**
 * =========================================================
 * FILE: BACK_END/src/routes/userAddress.routes.ts
 * =========================================================
 */

import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getUserAddresses,
  getUserAddressById,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "../controllers/userAddress.controller";

import {
  validateRequest,
  validateAddressId,
  validateCreateUserAddress,
  validateUpdateUserAddress,
  validateSetDefaultUserAddress,
} from "../validators/userAddress.validator";

const router = Router();

/**
 * Tất cả API địa chỉ đều yêu cầu đăng nhập.
 */
router.use(authMiddleware);

/**
 * GET /api/user-addresses
 * Lấy danh sách địa chỉ.
 */
router.get("/", getUserAddresses);

/**
 * POST /api/user-addresses
 * Tạo địa chỉ mới.
 */
router.post(
  "/",
  validateCreateUserAddress,
  validateRequest,
  createUserAddress
);

/**
 * PATCH /api/user-addresses/:id/default
 * Đặt địa chỉ mặc định.
 *
 * Đặt route này trước route /:id để dễ đọc và tránh
 * nhầm lẫn khi mở rộng router.
 */
router.patch(
  "/:id/default",
  validateAddressId,
  validateSetDefaultUserAddress,
  validateRequest,
  setDefaultUserAddress
);

/**
 * GET /api/user-addresses/:id
 * Lấy chi tiết địa chỉ.
 */
router.get(
  "/:id",
  validateAddressId,
  validateRequest,
  getUserAddressById
);

/**
 * PATCH /api/user-addresses/:id
 * Cập nhật địa chỉ.
 */
router.patch(
  "/:id",
  validateAddressId,
  validateUpdateUserAddress,
  validateRequest,
  updateUserAddress
);

/**
 * DELETE /api/user-addresses/:id
 * Xóa địa chỉ.
 */
router.delete(
  "/:id",
  validateAddressId,
  validateRequest,
  deleteUserAddress
);


export default router;