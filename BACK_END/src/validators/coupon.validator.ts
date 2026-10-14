import { body, param, query } from "express-validator";

export const couponIdParamValidator = [
  param("id").isMongoId().withMessage("ID mã giảm giá không hợp lệ"),
];

export const checkCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã giảm giá không được để trống")
    .isLength({ max: 50 })
    .withMessage("Mã giảm giá không được quá 50 ký tự"),
  body("orderAmount")
    .isFloat({ min: 0 })
    .withMessage("Giá trị đơn hàng phải là số lớn hơn hoặc bằng 0"),
];

export const createCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã giảm giá không được để trống")
    .isLength({ min: 3, max: 50 })
    .withMessage("Mã giảm giá phải từ 3 đến 50 ký tự")
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage("Mã giảm giá chỉ được chứa chữ cái, chữ số, gạch dưới và gạch ngang"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên mã giảm giá không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên không được vượt quá 150 ký tự"),
  body("description").optional({ nullable: true }).isString(),
  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("Kiểu giảm giá phải là 'percentage' hoặc 'fixed'"),
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Giá trị giảm giá phải lớn hơn hoặc bằng 0")
    .custom((value, { req }) => {
      if (
        req.body.discountType === "percentage" &&
        (Number(value) <= 0 || Number(value) > 100)
      ) {
        throw new Error("Phần trăm giảm giá phải nằm trong khoảng từ 1% đến 100%");
      }
      return true;
    }),
  body("minimumOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0"),
  body("maximumDiscountAmount")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Giảm tối đa phải lớn hơn hoặc bằng 0"),
  body("usageLimit")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Giới hạn lượt dùng phải là số nguyên tối thiểu là 1"),
  body("perUserLimit")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Giới hạn dùng mỗi khách hàng phải là số nguyên tối thiểu là 1"),
  body("startsAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Thời gian bắt đầu không đúng định dạng ngày giờ"),
  body("expiresAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Thời gian kết thúc không đúng định dạng ngày giờ")
    .custom((value, { req }) => {
      if (value && req.body.startsAt && new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu");
      }
      return true;
    }),
  body("isActive").optional().isBoolean(),
];

export const updateCouponValidator = [
  ...couponIdParamValidator,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên mã giảm giá không được để trống")
    .isLength({ max: 150 }),
  body("description").optional({ nullable: true }).isString(),
  body("discountType")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("Kiểu giảm giá phải là 'percentage' hoặc 'fixed'"),
  body("discountValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá trị giảm giá phải lớn hơn hoặc bằng 0"),
  body("minimumOrderAmount").optional().isFloat({ min: 0 }),
  body("maximumDiscountAmount").optional({ nullable: true }).isFloat({ min: 0 }),
  body("usageLimit").optional({ nullable: true }).isInt({ min: 1 }),
  body("perUserLimit").optional({ nullable: true }).isInt({ min: 1 }),
  body("startsAt").optional({ nullable: true }).isISO8601(),
  body("expiresAt").optional({ nullable: true }).isISO8601(),
  body("isActive").optional().isBoolean(),
];

export const adminCouponsQueryValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("isActive").optional().isBoolean(),
];
