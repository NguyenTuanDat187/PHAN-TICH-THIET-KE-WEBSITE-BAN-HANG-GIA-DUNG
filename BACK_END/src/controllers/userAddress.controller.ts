
import { Request, Response } from "express";
import {
  getMyAddressesService,
  getMyAddressByIdService,
  createAddressService,
  updateAddressService,
  setDefaultAddressService,
  deleteAddressService,
} from "../services/userAddress.service";

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    id?: string;
    role?: string;
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId ?? req.user?.id;

  if (!userId) {
    throw new Error("Không xác định được người dùng.");
  }

  return userId;
};

const handleError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Đã xảy ra lỗi.";

  const statusCode =
    message.includes("Không tìm thấy") ? 404 :
    message.includes("không hợp lệ") ? 400 : 500;

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// GET /api/user-addresses
export const getMyAddresses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await getMyAddressesService(getUserId(req));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/user-addresses/:id
export const getMyAddressById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await getMyAddressByIdService(
      getUserId(req),
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/user-addresses
export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await createAddressService(
      getUserId(req),
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Thêm địa chỉ thành công.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/user-addresses/:id
export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await updateAddressService(
      getUserId(req),
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/user-addresses/:id/default
export const setDefaultAddress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await setDefaultAddressService(
      getUserId(req),
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /api/user-addresses/:id
export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await deleteAddressService(
      getUserId(req),
      req.params.id
    );

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
