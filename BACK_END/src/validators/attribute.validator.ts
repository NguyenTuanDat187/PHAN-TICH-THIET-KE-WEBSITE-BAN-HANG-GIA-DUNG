import { body, param } from "express-validator";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const attributeIdParamValidator = [
  param("id").isMongoId().withMessage("ID thuộc tính không hợp lệ"),
];

export const attributeValueIdParamValidator = [
  param("valueId").isMongoId().withMessage("ID giá trị thuộc tính không hợp lệ"),
];

export const createAttributeValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên thuộc tính không được để trống")
    .isLength({ max: 100 })
    .withMessage("Tên thuộc tính không được vượt quá 100 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
];

export const updateAttributeValidator = [
  ...attributeIdParamValidator,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên thuộc tính không được để trống nếu truyền")
    .isLength({ max: 100 })
    .withMessage("Tên thuộc tính không được vượt quá 100 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
];

export const createAttributeValueValidator = [
  ...attributeIdParamValidator,
  body("value")
    .trim()
    .notEmpty()
    .withMessage("Giá trị thuộc tính không được để trống")
    .isLength({ max: 100 })
    .withMessage("Giá trị không được vượt quá 100 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
];

export const updateAttributeValueValidator = [
  ...attributeValueIdParamValidator,
  body("value")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Giá trị thuộc tính không được để trống nếu truyền")
    .isLength({ max: 100 })
    .withMessage("Giá trị không được vượt quá 100 ký tự"),
  body("slug")
    .optional()
    .trim()
    .matches(SLUG_REGEX)
    .withMessage("Slug chỉ bao gồm chữ thường, số và dấu gạch ngang"),
];
