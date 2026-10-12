import { Request, Response } from "express";
import * as wishlistService from "../services/wishlist.service";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
};

const getPathParam = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const items = await wishlistService.getUserWishlist(userId);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu thích thành công.",
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const item = await wishlistService.addToWishlist(userId, req.body.productId);
    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm vào danh sách yêu thích thành công.",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const checkWishlistStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await wishlistService.checkProductInWishlist(
      userId,
      getPathParam(req.params.productId)
    );
    return res.status(200).json({
      success: true,
      message: "Kiểm tra trạng thái yêu thích thành công.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await wishlistService.removeFromWishlist(
      userId,
      getPathParam(req.params.id)
    );
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const removeByProductId = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await wishlistService.removeByProductId(
      userId,
      getPathParam(req.params.productId)
    );
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const moveToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await wishlistService.moveWishlistItemToCart(
      userId,
      getPathParam(req.params.id),
      req.body
    );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.cartItem,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await wishlistService.clearUserWishlist(userId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};
