import { Request, Response } from "express";
import * as checkoutService from "../services/checkout.service";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
};

export const previewCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const summary = await checkoutService.reviewCheckout(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Xem trước thông tin đơn hàng thành công.",
      data: summary,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const submitCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await checkoutService.placeOrder(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công.",
      data: { order: result.order, items: result.items },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};
