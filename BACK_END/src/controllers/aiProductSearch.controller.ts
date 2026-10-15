/**
 * =========================================================
 * FILE: BACK_END/src/controllers/aiProductSearch.controller.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Nhận request tìm kiếm sản phẩm bằng AI.
 * - Kiểm tra dữ liệu đầu vào bằng express-validator.
 * - Gọi service xử lý tìm kiếm sản phẩm.
 * - Trả kết quả tìm kiếm dưới dạng JSON.
 * - Chuyển lỗi phát sinh sang middleware xử lý lỗi tập trung.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import {
  aiProductSearchService,
} from "../services/aiProductSearch.service";

/**
 * =========================================================
 * CONTROLLER: TÌM KIẾM SẢN PHẨM BẰNG AI
 * =========================================================
 *
 * REQUEST BODY:
 * {
 *   "query": "Tìm nồi chiên không dầu dưới 2 triệu",
 *   "page": 1,
 *   "limit": 5
 * }
 */
export const aiProductSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    /**
     * -------------------------------------------------------
     * BƯỚC 1: KIỂM TRA VALIDATION
     * -------------------------------------------------------
     *
     * Các quy tắc kiểm tra được khai báo tại validator.
     * Controller chỉ nhận kết quả validation, không tự
     * triển khai lại các quy tắc kiểm tra.
     */
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Dữ liệu tìm kiếm không hợp lệ.",
        errors: errors.array(),
      });
      return;
    }

    /**
     * -------------------------------------------------------
     * BƯỚC 2: LẤY DỮ LIỆU REQUEST
     * -------------------------------------------------------
     */
    const query = String(req.body.query ?? "").trim();
    const page = Number(req.body.page ?? 1);
    const limit = Number(req.body.limit ?? 5);

    /**
     * -------------------------------------------------------
     * BƯỚC 3: GỌI SERVICE TÌM KIẾM SẢN PHẨM
     * -------------------------------------------------------
     */
    const data = await aiProductSearchService({
      query,
      page,
      limit,
    });

    /**
     * -------------------------------------------------------
     * BƯỚC 4: TRẢ KẾT QUẢ THÀNH CÔNG
     * -------------------------------------------------------
     */
    res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công.",
      data,
    });
  } catch (error: unknown) {
    /**
     * -------------------------------------------------------
     * BƯỚC 5: CHUYỂN LỖI CHO ERROR MIDDLEWARE
     * -------------------------------------------------------
     *
     * Không trả lỗi 500 trực tiếp tại đây để tránh trùng
     * lặp logic xử lý lỗi giữa các controller.
     */
    next(error);
  }
};