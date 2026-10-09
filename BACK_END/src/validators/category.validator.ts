import { body, param, query } from "express-validator";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryIdParamValidator = [
  param("id").isMongoId().withMessage("ID danh mục không hợp lệ"),
];

export const categorySlugParamValidator = [
  param("slug").trim().notEmpty().withMessage("Slug danh mục không được để trống"),
];

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên danh mục không được vượt quá 150 ký tự"),
  body("parentId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("parentId không hợp lệ"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
  body("description").optional({ nullable: true }).trim(),
  body("image")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("URL hình ảnh không được vượt quá 500 ký tự"),
  body("metaTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("metaTitle không được vượt quá 255 ký tự"),
  body("metaDescription").optional({ nullable: true }).trim(),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("sortOrder phải là số nguyên không âm")
    .toInt(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean")
    .toBoolean(),
];

export const updateCategoryValidator = [
  ...categoryIdParamValidator,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục không được để trống nếu truyền")
    .isLength({ max: 150 })
    .withMessage("Tên danh mục không được vượt quá 150 ký tự"),
  body("parentId")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value && value === req.params?.id) {
        throw new Error("Không thể chọn chính danh mục này làm danh mục cha.");
      }
      return true;
    }),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
  body("description").optional({ nullable: true }).trim(),
  body("image")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("URL hình ảnh không được vượt quá 500 ký tự"),
  body("metaTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("metaTitle không được vượt quá 255 ký tự"),
  body("metaDescription").optional({ nullable: true }).trim(),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("sortOrder phải là số nguyên không âm")
    .toInt(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean")
    .toBoolean(),
];

export const toggleCategoryStatusValidator = [
  ...categoryIdParamValidator,
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean")
    .toBoolean(),
];

export const updateSortOrderValidator = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("items phải là mảng chứa danh sách danh mục cần cập nhật thứ tự"),
  body("items.*.id").isMongoId().withMessage("ID danh mục không hợp lệ"),
  body("items.*.sortOrder")
    .isInt({ min: 0 })
    .withMessage("sortOrder phải là số nguyên không âm")
    .toInt(),
];

export const queryCategoryValidator = [
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
  query("parentId").optional({ nullable: true }),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là giá trị boolean")
    .toBoolean(),
  query("sortBy")
    .optional()
    .isIn(["name", "sortOrder", "createdAt", "updatedAt"])
    .withMessage("sortBy chỉ chấp nhận: name, sortOrder, createdAt, updatedAt"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder chỉ chấp nhận: asc, desc"),
];
