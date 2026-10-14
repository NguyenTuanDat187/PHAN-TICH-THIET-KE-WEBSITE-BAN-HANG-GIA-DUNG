import { body, param } from "express-validator";

export const wishlistIdParamValidator = [
  param("id").isMongoId().withMessage("ID mục yêu thích không hợp lệ"),
];

export const productIdParamValidator = [
  param("productId").isMongoId().withMessage("productId không hợp lệ"),
];

export const addToWishlistValidator = [
  body("productId")
    .notEmpty()
    .withMessage("productId không được để trống")
    .isMongoId()
    .withMessage("productId không đúng định dạng MongoDB ObjectId"),
];

export const moveToCartValidator = [
  ...wishlistIdParamValidator,
  body("variantId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("variantId không đúng định dạng"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên tối thiểu là 1"),
];
