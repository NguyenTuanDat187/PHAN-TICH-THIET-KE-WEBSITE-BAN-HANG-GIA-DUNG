
/**
 * =========================================================
 * FILE: BACK_END/src/controllers/aiProductSearch.controller.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Nhận request tìm kiếm sản phẩm bằng AI.
 * - Trả lỗi validation nếu dữ liệu không hợp lệ.
 * - Gọi service và trả response JSON.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import {
  aiProductSearchService,
} from "../services/aiProductSearch.service";

export const aiProductSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Dữ liệu tìm kiếm không hợp lệ.",
        errors: errors.array(),
      });
      return;
    }

    const query = String(req.body.query).trim();
    const page = Number(req.body.page ?? 1);
    const limit = Number(req.body.limit ?? 5);

    const data = await aiProductSearchService({
      query,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};
