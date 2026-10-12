
import { body, param } from "express-validator";

/**
 * FILE: src/validators/userAddress.validator.ts
 *
 * Kiểm tra dữ liệu đầu vào khi quản lý địa chỉ giao hàng.
 */

// Kiểm tra ID địa chỉ trên URL.
export const validateAddressId = [
  param("id")
    .isMongoId()
    .withMessage("ID địa chỉ không hợp lệ."),
];

// Kiểm tra dữ liệu khi tạo địa chỉ.
export const validateCreateAddress = [
  body("recipientName")
    .trim()
    .notEmpty()
    .withMessage("Tên người nhận không được để trống.")
    .isLength({ max: 150 })
    .withMessage("Tên người nhận tối đa 150 ký tự."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống.")
    .isLength({ max: 20 })
    .withMessage("Số điện thoại tối đa 20 ký tự."),

  body("addressLine")
    .trim()
    .notEmpty()
    .withMessage("Địa chỉ chi tiết không được để trống."),

  body("ward")
    .optional({ nullable: true })
    .isString()
    .withMessage("Phường/Xã phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Phường/Xã tối đa 100 ký tự."),

  body("district")
    .optional({ nullable: true })
    .isString()
    .withMessage("Quận/Huyện phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Quận/Huyện tối đa 100 ký tự."),

  body("province")
    .optional({ nullable: true })
    .isString()
    .withMessage("Tỉnh/Thành phố phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Tỉnh/Thành phố tối đa 100 ký tự."),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là true hoặc false."),
];

// Kiểm tra dữ liệu cập nhật địa chỉ.
export const validateUpdateAddress = [
  ...validateAddressId,

  body("recipientName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên người nhận không được để trống.")
    .isLength({ max: 150 })
    .withMessage("Tên người nhận tối đa 150 ký tự."),

  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống.")
    .isLength({ max: 20 })
    .withMessage("Số điện thoại tối đa 20 ký tự."),

  body("addressLine")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Địa chỉ chi tiết không được để trống."),

  body("ward")
    .optional({ nullable: true })
    .isString()
    .withMessage("Phường/Xã phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Phường/Xã tối đa 100 ký tự."),

  body("district")
    .optional({ nullable: true })
    .isString()
    .withMessage("Quận/Huyện phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Quận/Huyện tối đa 100 ký tự."),

  body("province")
    .optional({ nullable: true })
    .isString()
    .withMessage("Tỉnh/Thành phố phải là chuỗi.")
    .isLength({ max: 100 })
    .withMessage("Tỉnh/Thành phố tối đa 100 ký tự."),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là true hoặc false."),
];
