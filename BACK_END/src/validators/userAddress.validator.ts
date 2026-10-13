
/**
 * FILE: BACK_END/src/validators/userAddress.validator.ts
 *
 * Nhiệm vụ:
 * - Kiểm tra dữ liệu địa chỉ giao hàng.
 * - Kiểm tra MongoDB ObjectId.
 * - Không xử lý nghiệp vụ tại validator.
 */

import { body, param, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware đọc kết quả validation.
 *
 * Nếu dữ liệu không hợp lệ, trả về HTTP 400.
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ.",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : undefined,
        message: error.msg,
      })),
    });
    return;
  }

  next();
};

/**
 * Kiểm tra ID địa chỉ.
 */
export const validateAddressId = [
  param("id")
    .isMongoId()
    .withMessage("ID địa chỉ không hợp lệ."),
];

/**
 * Kiểm tra dữ liệu tạo địa chỉ.
 */
export const validateCreateUserAddress = [
  body("recipientName")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập tên người nhận.")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Tên người nhận không được vượt quá 150 ký tự."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại.")
    .bail()
    .matches(/^[0-9+\-\s()]{9,20}$/)
    .withMessage("Số điện thoại không hợp lệ."),

  body("addressLine")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập địa chỉ chi tiết.")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Địa chỉ chi tiết không được vượt quá 255 ký tự."),

  body("ward")
    .optional({ nullable: true })
    .isString()
    .withMessage("Phường/xã phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Phường/xã không được vượt quá 100 ký tự."),

  body("district")
    .optional({ nullable: true })
    .isString()
    .withMessage("Quận/huyện phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Quận/huyện không được vượt quá 100 ký tự."),

  body("province")
    .optional({ nullable: true })
    .isString()
    .withMessage("Tỉnh/thành phố phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Tỉnh/thành phố không được vượt quá 100 ký tự."),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là true hoặc false."),
];

/**
 * Kiểm tra dữ liệu cập nhật địa chỉ.
 * Chỉ kiểm tra những trường được gửi lên.
 */
export const validateUpdateUserAddress = [
  body("recipientName")
    .optional()
    .isString()
    .withMessage("Tên người nhận phải là chuỗi.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Tên người nhận không được để trống.")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Tên người nhận không được vượt quá 150 ký tự."),

  body("phone")
    .optional()
    .isString()
    .withMessage("Số điện thoại phải là chuỗi.")
    .bail()
    .trim()
    .matches(/^[0-9+\-\s()]{9,20}$/)
    .withMessage("Số điện thoại không hợp lệ."),

  body("addressLine")
    .optional()
    .isString()
    .withMessage("Địa chỉ chi tiết phải là chuỗi.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Địa chỉ chi tiết không được để trống.")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Địa chỉ chi tiết không được vượt quá 255 ký tự."),

  body("ward")
    .optional({ nullable: true })
    .isString()
    .withMessage("Phường/xã phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Phường/xã không được vượt quá 100 ký tự."),

  body("district")
    .optional({ nullable: true })
    .isString()
    .withMessage("Quận/huyện phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Quận/huyện không được vượt quá 100 ký tự."),

  body("province")
    .optional({ nullable: true })
    .isString()
    .withMessage("Tỉnh/thành phố phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Tỉnh/thành phố không được vượt quá 100 ký tự."),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là true hoặc false."),

  body().custom((value) => {
    const allowedFields = [
      "recipientName",
      "phone",
      "addressLine",
      "ward",
      "district",
      "province",
      "isDefault",
    ];

    const hasAllowedField = Object.keys(value).some((key) =>
      allowedFields.includes(key)
    );

    if (!hasAllowedField) {
      throw new Error("Vui lòng cung cấp ít nhất một trường cần cập nhật.");
    }

    return true;
  }),
];

/**
 * Kiểm tra dữ liệu đặt địa chỉ mặc định.
 */
export const validateSetDefaultUserAddress = [
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là true hoặc false.")
    .custom((value) => {
      if (value === false || value === "false") {
        throw new Error("Thao tác này chỉ dùng để đặt địa chỉ mặc định.");
      }

      return true;
    }),
];
