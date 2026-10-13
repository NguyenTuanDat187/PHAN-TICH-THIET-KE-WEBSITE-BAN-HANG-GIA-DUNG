/**
 * =========================================================
 * FILE: BACK_END/src/controllers/userAddress.controller.ts
 * =========================================================
 *
 * Nhiệm vụ:
 * - Tiếp nhận request từ Router.
 * - Lấy userId từ JWT middleware thông qua req.user.
 * - Gọi Service xử lý nghiệp vụ.
 * - Trả kết quả JSON thống nhất.
 * - Chuyển lỗi sang error-handling middleware.
 *
 * Lưu ý:
 * - Không lấy userId từ body hoặc query của client.
 * - Người dùng chỉ được thao tác với địa chỉ thuộc tài khoản mình.
 * - req.user được khai báo mở rộng trong auth.middleware.ts.
 * =========================================================
 */

import type { Request, Response, NextFunction } from "express";

import {
  getUserAddressesService,
  getUserAddressByIdService,
  createUserAddressService,
  updateUserAddressService,
  deleteUserAddressService,
  setDefaultUserAddressService,
} from "../services/userAddress.service";

import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
} from "../services/userAddress.service";

/**
 * Lấy ID người dùng đã được authMiddleware xác thực.
 *
 * req.user được khai báo trong:
 * BACK_END/src/middleware/auth.middleware.ts
 */
const getAuthenticatedUserId = (req: Request): string => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Không tìm thấy thông tin người dùng.") as
      Error & { statusCode: number };

    error.statusCode = 401;
    throw error;
  }

  return userId;
};
/**
 * Lấy và kiểm tra ID địa chỉ từ URL.
 */

/**
 * Lấy ID địa chỉ từ URL và kiểm tra kiểu dữ liệu.
 */
const readAddressId = (req: Request): string => {
  const addressId = req.params.id;

  if (typeof addressId !== "string" || addressId.trim() === "") {
    const error = new Error("ID địa chỉ không hợp lệ.") as
      Error & { statusCode: number };

    error.statusCode = 400;
    throw error;
  }

  return addressId;
};

/**
 * =========================================================
 * GET /api/user-addresses
 * Lấy danh sách địa chỉ của tài khoản đang đăng nhập.
 * =========================================================
 */

/**
 * GET /api/user-addresses
 * Lấy danh sách địa chỉ của tài khoản đăng nhập.
 */
export const getUserAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addresses = await getUserAddressesService(userId);

    res.status(200).json({
      success: true,
      message:
        addresses.length === 0
          ? "Bạn chưa có địa chỉ giao hàng nào."
          : "Lấy danh sách địa chỉ thành công.",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * =========================================================
 * GET /api/user-addresses/:id
 * Lấy chi tiết một địa chỉ thuộc tài khoản đang đăng nhập.
 * =========================================================
 */
export const getUserAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addressId = readAddressId(req);
    const address = await getUserAddressByIdService(
      userId,
      addressId
    );

    res.status(200).json({
      success: true,
      message: "Lấy thông tin địa chỉ thành công.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * POST /api/user-addresses
 * Tạo địa chỉ giao hàng mới.
 * =========================================================
 */
export const createUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    // Validator tại Router kiểm tra dữ liệu trước khi đến đây.
    const input = req.body as CreateUserAddressInput;

    const address = await createUserAddressService(
      userId,
      input
    );

    res.status(201).json({
      success: true,
      message: "Thêm địa chỉ giao hàng thành công.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * PATCH /api/user-addresses/:id
 * Cập nhật thông tin địa chỉ.
 * =========================================================
 */
export const updateUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addressId = readAddressId(req);
    // Chỉ cập nhật các trường được validator cho phép.
    const input = req.body as UpdateUserAddressInput;

    const address = await updateUserAddressService(
      userId,
      addressId,
      input
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * DELETE /api/user-addresses/:id
 * Xóa địa chỉ thuộc tài khoản đang đăng nhập.
 * =========================================================
 */
export const deleteUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addressId = readAddressId(req); await deleteUserAddressService(userId, addressId);

    res.status(200).json({
      success: true,
      message: "Xóa địa chỉ thành công.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * PATCH /api/user-addresses/:id/default
 * Đặt địa chỉ làm địa chỉ mặc định.
 * =========================================================
 */
export const setDefaultUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addressId = readAddressId(req); const address = await setDefaultUserAddressService(
      userId,
      addressId
    );

    res.status(200).json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};