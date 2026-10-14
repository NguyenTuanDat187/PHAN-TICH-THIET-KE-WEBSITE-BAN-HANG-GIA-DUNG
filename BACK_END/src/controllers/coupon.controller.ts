import { Request, Response } from "express";
import * as couponService from "../services/coupon.service";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
};

const getPathParam = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const getPublicCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await couponService.getPublicCoupons();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách mã giảm giá công khai thành công.",
      data: coupons,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const checkCoupon = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { code, orderAmount } = req.body;
    const result = await couponService.validateAndCalculateCoupon(
      userId,
      code,
      Number(orderAmount)
    );
    return res.status(200).json({
      success: true,
      message: "Áp dụng mã giảm giá thành công.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAllCouponsAdmin = async (req: Request, res: Response) => {
  try {
    const data = await couponService.getAllCouponsAdmin(req.query as any);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách quản trị mã giảm giá thành công.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getCouponByIdAdmin = async (req: Request, res: Response) => {
  try {
    const coupon = await couponService.getCouponByIdAdmin(getPathParam(req.params.id));
    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết mã giảm giá thành công.",
      data: coupon,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: getErrorMessage(error) });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá mới thành công.",
      data: coupon,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await couponService.updateCoupon(getPathParam(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật mã giảm giá thành công.",
      data: coupon,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const toggleCouponStatus = async (req: Request, res: Response) => {
  try {
    const coupon = await couponService.toggleCouponStatus(getPathParam(req.params.id));
    return res.status(200).json({
      success: true,
      message: "Thay đổi trạng thái mã giảm giá thành công.",
      data: coupon,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const result = await couponService.deleteCoupon(getPathParam(req.params.id));
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getCouponUsages = async (req: Request, res: Response) => {
  try {
    const data = await couponService.getCouponUsages(
      getPathParam(req.params.id),
      req.query as any
    );
    return res.status(200).json({
      success: true,
      message: "Lấy lịch sử sử dụng mã thành công.",
      data,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};
