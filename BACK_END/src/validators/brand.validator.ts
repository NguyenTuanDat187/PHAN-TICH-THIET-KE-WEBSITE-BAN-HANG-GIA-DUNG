import { body, param, query } from "express-validator";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const brandIdParamValidator = [
  param("id").isMongoId().withMessage("ID thương hiệu không hợp lệ"),
];

export const brandSlugParamValidator = [
  param("slug").trim().notEmpty().withMessage("Slug không được để trống"),
];

export const createBrandValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên thương hiệu không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên thương hiệu không được vượt quá 150 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
  body("description").optional().trim(),
  body("logo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("URL logo không được vượt quá 500 ký tự"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean"),
];

export const updateBrandValidator = [
  ...brandIdParamValidator,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên thương hiệu không được để trống nếu truyền")
    .isLength({ max: 150 })
    .withMessage("Tên thương hiệu không được vượt quá 150 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
  body("description").optional().trim(),
  body("logo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("URL logo không được vượt quá 500 ký tự"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean"),
];

export const toggleBrandStatusValidator = [
  ...brandIdParamValidator,
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean"),
];

export const queryBrandValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên >= 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải là số nguyên trong khoảng 1 - 100")
    .toInt(),
  query("search").optional().trim(),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean")
    .toBoolean(),
  query("sortBy")
    .optional()
    .isIn(["name", "createdAt", "updatedAt"])
    .withMessage("sortBy chỉ chấp nhận: name, createdAt, updatedAt"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder chỉ chấp nhận: asc, desc"),
];
