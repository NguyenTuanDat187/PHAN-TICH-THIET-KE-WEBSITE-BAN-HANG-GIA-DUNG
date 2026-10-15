import { query, param } from "express-validator";

export const orderIdParamValidator = [
  param("id").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
];

export const adminOrderItemsQueryValidator = [
  query("orderId").optional().isMongoId().withMessage("orderId không đúng định dạng"),
  query("productId")
    .optional()
    .isMongoId()
    .withMessage("productId không đúng định dạng"),
  query("variantId")
    .optional()
    .isMongoId()
    .withMessage("variantId không đúng định dạng"),
  query("from")
    .optional()
    .isISO8601()
    .withMessage("from phải là ngày ISO8601 hợp lệ"),
  query("to").optional().isISO8601().withMessage("to phải là ngày ISO8601 hợp lệ"),
  query("page").optional().isInt({ min: 1 }).withMessage("page phải là số nguyên >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit từ 1 đến 100"),
];
