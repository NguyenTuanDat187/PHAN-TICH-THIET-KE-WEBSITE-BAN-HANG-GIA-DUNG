
import { Router } from "express";
import {
  getMyAddresses,
  getMyAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/userAddress.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validateRequest.middleware";

import {
  validateAddressId,
  validateCreateAddress,
  validateUpdateAddress,
} from "../validators/userAddress.validator";

const router = Router();

// Tất cả endpoint đều yêu cầu đăng nhập.
router.use(authMiddleware);

// Danh sách địa chỉ của người dùng hiện tại.
router.get("/", getMyAddresses);

// Thêm địa chỉ.
router.post(
  "/",
  validateCreateAddress,
  validateRequest,
  createAddress
);

// Lấy chi tiết địa chỉ.
router.get(
  "/:id",
  validateAddressId,
  validateRequest,
  getMyAddressById
);

// Cập nhật địa chỉ.
router.patch(
  "/:id",
  validateUpdateAddress,
  validateRequest,
  updateAddress
);

// Đặt địa chỉ mặc định.
router.patch(
  "/:id/default",
  validateAddressId,
  validateRequest,
  setDefaultAddress
);

// Xóa địa chỉ.
router.delete(
  "/:id",
  validateAddressId,
  validateRequest,
  deleteAddress
);

export default router;
