import { body, param } from "express-validator";

export const productIdParamValidator = [
  param("productId").isMongoId().withMessage("productId không hợp lệ"),
];

export const mediaIdParamValidator = [
  param("id").isMongoId().withMessage("mediaId không hợp lệ"),
];

export const createMediaValidator = [
  ...productIdParamValidator,
  body("mediaType")
    .isIn(["image", "video"])
    .withMessage("mediaType phải là 'image' hoặc 'video'"),
  body("mediaUrl")
    .trim()
    .notEmpty()
    .withMessage("mediaUrl không được để trống")
    .isLength({ max: 500 })
    .withMessage("mediaUrl tối đa 500 ký tự"),
  body("altText").optional({ nullable: true }).trim().isLength({ max: 255 }),
  body("sortOrder").optional().isInt({ min: 0 }).toInt(),
  body("isPrimary").optional().isBoolean(),
];

export const createBatchMediaValidator = [
  ...productIdParamValidator,
  body("mediaList")
    .isArray({ min: 1 })
    .withMessage("mediaList phải là một mảng có ít nhất 1 phần tử"),
  body("mediaList.*.mediaType")
    .isIn(["image", "video"])
    .withMessage("mediaType phải là 'image' hoặc 'video'"),
  body("mediaList.*.mediaUrl")
    .trim()
    .notEmpty()
    .withMessage("mediaUrl không được để trống")
    .isLength({ max: 500 }),
  body("mediaList.*.altText")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body("mediaList.*.sortOrder").optional().isInt({ min: 0 }).toInt(),
  body("mediaList.*.isPrimary").optional().isBoolean(),
];

export const updateMediaValidator = [
  ...mediaIdParamValidator,
  body("altText").optional({ nullable: true }).trim().isLength({ max: 255 }),
  body("sortOrder").optional().isInt({ min: 0 }).toInt(),
  body("isPrimary").optional().isBoolean(),
];

export const updateSortOrderValidator = [
  ...productIdParamValidator,
  body("sortOrders")
    .isArray({ min: 1 })
    .withMessage("sortOrders phải là một mảng có ít nhất 1 phần tử"),
  body("sortOrders.*.id").isMongoId().withMessage("ID media không hợp lệ"),
  body("sortOrders.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage("sortOrder phải là số nguyên >= 0")
    .toInt(),
];

export const deleteBatchMediaValidator = [
  ...productIdParamValidator,
  body("mediaIds")
    .isArray({ min: 1 })
    .withMessage("mediaIds phải là một mảng ID"),
  body("mediaIds.*")
    .isMongoId()
    .withMessage("ID media trong mediaIds không hợp lệ"),
];
