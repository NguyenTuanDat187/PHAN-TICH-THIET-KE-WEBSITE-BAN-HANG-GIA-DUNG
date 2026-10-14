import { body, param } from "express-validator";

export const cartIdParamValidator = [
  param("id").isMongoId().withMessage("ID giỏ hàng không hợp lệ"),
];

export const addToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("productId không được để trống")
    .isMongoId()
    .withMessage("productId không đúng định dạng"),
  body("variantId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("variantId không đúng định dạng"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Số lượng sản phẩm phải là số nguyên tối thiểu là 1"),
];

export const updateCartQuantityValidator = [
  ...cartIdParamValidator,
  body("quantity")
    .notEmpty()
    .withMessage("Số lượng không được để trống")
    .isInt({ min: 1 })
    .withMessage("Số lượng sản phẩm phải là số nguyên tối thiểu là 1"),
];
