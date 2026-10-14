import { body, param } from "express-validator";

export const productIdParamValidator = [
  param("productId").isMongoId().withMessage("productId không hợp lệ"),
];

export const variantIdParamValidator = [
  param("id").isMongoId().withMessage("variantId không hợp lệ"),
];

export const createVariantValidator = [
  ...productIdParamValidator,
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("Mã SKU biến thể không được để trống")
    .isLength({ max: 100 })
    .withMessage("Mã SKU biến thể không được vượt quá 100 ký tự"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Giá biến thể phải lớn hơn hoặc bằng 0")
    .toFloat(),
  body("compareAtPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),
  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Số lượng tồn kho phải là số nguyên không âm")
    .toInt(),
  body("weight").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("image").optional({ nullable: true }).isString().isLength({ max: 500 }),
  body("isActive").optional().isBoolean(),
  body("attributes")
    .optional()
    .isArray()
    .withMessage("attributes phải là một mảng"),
  body("attributes.*.attributeId")
    .isMongoId()
    .withMessage("attributeId trong attributes không hợp lệ"),
  body("attributes.*.attributeValueId")
    .isMongoId()
    .withMessage("attributeValueId trong attributes không hợp lệ"),
];

export const updateVariantValidator = [
  ...variantIdParamValidator,
  body("sku")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mã SKU biến thể không được để trống")
    .isLength({ max: 100 }),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("compareAtPrice").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("stockQuantity").optional().isInt({ min: 0 }).toInt(),
  body("weight").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("image").optional({ nullable: true }).isString().isLength({ max: 500 }),
  body("isActive").optional().isBoolean(),
  body("attributes").optional().isArray(),
  body("attributes.*.attributeId")
    .isMongoId()
    .withMessage("attributeId trong attributes không hợp lệ"),
  body("attributes.*.attributeValueId")
    .isMongoId()
    .withMessage("attributeValueId trong attributes không hợp lệ"),
];

export const updateStockValidator = [
  ...variantIdParamValidator,
  body("stockQuantity")
    .isInt({ min: 0 })
    .withMessage("Số lượng tồn kho phải là số nguyên không âm")
    .toInt(),
];
