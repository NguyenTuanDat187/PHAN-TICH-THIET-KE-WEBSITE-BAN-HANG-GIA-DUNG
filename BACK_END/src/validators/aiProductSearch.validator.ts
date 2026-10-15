
/**
 * =========================================================
 * FILE: BACK_END/src/validators/aiProductSearch.validator.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Kiểm tra câu tìm kiếm.
 * - Kiểm tra số trang và số sản phẩm mỗi trang.
 */

import { body } from "express-validator";

export const aiProductSearchValidator = [
  body("query")
    .exists()
    .withMessage("Câu tìm kiếm là bắt buộc.")
    .bail()
    .isString()
    .withMessage("Câu tìm kiếm phải là chuỗi.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Câu tìm kiếm không được để trống.")
    .bail()
    .isLength({ min: 2, max: 500 })
    .withMessage(
      "Câu tìm kiếm phải dài từ 2 đến 500 ký tự.",
    ),

  body("page")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("page phải là số nguyên từ 1 trở lên.")
    .toInt(),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("limit phải nằm trong khoảng 1 đến 20.")
    .toInt(),
];
