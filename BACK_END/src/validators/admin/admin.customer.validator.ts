/**
 * FILE: BACK_END/src/validators/admin/admin.customer.validator.ts
 *
 * NHIỆM VỤ:
 * - Kiểm tra query danh sách khách hàng.
 * - Kiểm tra ID khách hàng.
 * - Kiểm tra trạng thái cập nhật.
 * - Trả lỗi trước khi request đến controller.
 */

import {
  param,
  query,
  body,
  validationResult,
} from "express-validator";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

/**
 * VALIDATOR: DANH SÁCH KHÁCH HÀNG
 */
export const getAdminCustomersValidator = [
  query("keyword")
    .optional()
    .isString()
    .withMessage("Từ khóa tìm kiếm phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Từ khóa tìm kiếm không được vượt quá 100 ký tự."
    ),

  query("status")
    .optional()
    .isIn(["active", "inactive", "blocked"])
    .withMessage("Trạng thái khách hàng không hợp lệ."),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Số trang phải là số nguyên lớn hơn hoặc bằng 1."
    ),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit phải nằm trong khoảng từ 1 đến 100."),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "name", "email"])
    .withMessage("Trường sắp xếp không hợp lệ."),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage(
      "Thứ tự sắp xếp chỉ được là asc hoặc desc."
    ),
];

/**
 * VALIDATOR: CHI TIẾT KHÁCH HÀNG
 */
export const getAdminCustomerByIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "ID khách hàng không đúng định dạng MongoDB."
    ),
];

/**
 * VALIDATOR: CẬP NHẬT TRẠNG THÁI KHÁCH HÀNG
 */
export const updateAdminCustomerStatusValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "ID khách hàng không đúng định dạng MongoDB."
    ),

  body("status")
    .isIn(["active", "inactive", "blocked"])
    .withMessage(
      "Trạng thái chỉ được là active, inactive hoặc blocked."
    ),
];

/**
 * MIDDLEWARE: TRẢ LỖI VALIDATION THỐNG NHẤT
 */
export const validateAdminCustomerRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu yêu cầu không hợp lệ.",
      errors: errors.array().map((error) => ({
        field:
          error.type === "field" ? error.path : undefined,
        message: error.msg,
      })),
    });

    return;
  }

  next();
};