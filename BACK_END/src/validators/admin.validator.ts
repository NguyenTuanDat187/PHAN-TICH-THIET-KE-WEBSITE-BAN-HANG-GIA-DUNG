/**
 * =========================================================
 * FILE: BACK_END/src/validators/admin.validator.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Kiểm tra dữ liệu đầu vào cho các chức năng tài khoản Admin.
 * - Không truy vấn database.
 * - Không xác minh OTP thực tế.
 * - Không xử lý bcrypt hoặc JWT.
 *
 * BẢO MẬT:
 * - Route Admin phải có auth middleware và middleware kiểm tra role.
 * - Không tin role, userId hoặc status do client gửi.
 * =========================================================
 */

import { body } from "express-validator";

/* =========================================================
 * 1. CÁC QUY TẮC VALIDATION
 * ========================================================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[3-9][0-9]{8}$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const OTP_REGEX = /^\d{6}$/;

/** Kiểm tra email và chuẩn hóa email. */
const emailValidator = (field = "email") =>
  body(field)
    .isString()
    .withMessage("Email phải là chuỗi ký tự.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc.")
    .bail()
    .isEmail()
    .withMessage("Email không đúng định dạng.")
    .bail()
    .matches(EMAIL_REGEX)
    .withMessage("Email không hợp lệ.")
    .normalizeEmail();

/** Kiểm tra OTP gồm đúng 6 chữ số. */
const otpValidator = (field = "otp") =>
  body(field)
    .isString()
    .withMessage("OTP phải là chuỗi ký tự.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("OTP là bắt buộc.")
    .bail()
    .matches(OTP_REGEX)
    .withMessage("OTP phải gồm đúng 6 chữ số.");

/**
 * Mật khẩu phải có ít nhất 8 ký tự,
 * gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
 */
const passwordValidator = (field = "password") =>
  body(field)
    .isString()
    .withMessage("Mật khẩu phải là chuỗi ký tự.")
    .bail()
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc.")
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
    );

/** Kiểm tra mật khẩu xác nhận trùng với mật khẩu tương ứng. */
const confirmPasswordValidator = (
  confirmField = "confirmPassword",
  passwordField = "password",
  label = "Xác nhận mật khẩu"
) =>
  body(confirmField)
    .isString()
    .withMessage(`${label} phải là chuỗi ký tự.`)
    .bail()
    .notEmpty()
    .withMessage(`${label} là bắt buộc.`)
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body[passwordField]) {
        throw new Error(`${label} không khớp.`);
      }

      return true;
    });

/* =========================================================
 * 2. ĐĂNG NHẬP ADMIN
 * =========================================================
 *
 * Validator chỉ kiểm tra dữ liệu.
 * Service bắt buộc kiểm tra:
 * - Tài khoản có tồn tại hay không.
 * - role có đúng là "admin" hay không.
 * - Trạng thái tài khoản có cho phép đăng nhập hay không.
 * - Mật khẩu có chính xác hay không.
 * =========================================================
 */

export const adminLoginValidator = [
  emailValidator("email"),

  body("password")
    .isString()
    .withMessage("Mật khẩu phải là chuỗi ký tự.")
    .bail()
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc."),
];

/* =========================================================
 * 3. QUÊN MẬT KHẨU VÀ ĐẶT LẠI MẬT KHẨU ADMIN
 * ========================================================= */

/** Yêu cầu OTP quên mật khẩu bằng email. */
export const adminForgotPasswordValidator = [
  emailValidator("email"),
];

/**
 * Đặt lại mật khẩu Admin bằng email + OTP + mật khẩu mới.
 *
 * Service phải xác minh OTP và chỉ cho phép thao tác với
 * tài khoản Admin hợp lệ.
 */
export const adminResetPasswordValidator = [
  emailValidator("email"),
  otpValidator("otp"),
  passwordValidator("newPassword"),

  confirmPasswordValidator(
    "confirmPassword",
    "newPassword",
    "Xác nhận mật khẩu mới"
  ),
];

/* =========================================================
 * 4. ĐỔI MẬT KHẨU ADMIN KHI ĐÃ ĐĂNG NHẬP
 * ========================================================= */

export const adminChangePasswordValidator = [
  body("currentPassword")
    .isString()
    .withMessage("Mật khẩu hiện tại phải là chuỗi ký tự.")
    .bail()
    .notEmpty()
    .withMessage("Mật khẩu hiện tại là bắt buộc."),

  passwordValidator("newPassword"),

  confirmPasswordValidator(
    "confirmPassword",
    "newPassword",
    "Xác nhận mật khẩu mới"
  ),
];

/* =========================================================
 * 5. YÊU CẦU ĐỔI EMAIL ADMIN
 * ========================================================= */

/**
 * Kiểm tra định dạng email mới.
 * Service kiểm tra email đã được tài khoản khác sử dụng chưa.
 */
const newEmailValidator = () =>
  body("newEmail")
    .isString()
    .withMessage("Email mới phải là chuỗi ký tự.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email mới là bắt buộc.")
    .bail()
    .isEmail()
    .withMessage("Email mới không đúng định dạng.")
    .bail()
    .matches(EMAIL_REGEX)
    .withMessage("Email mới không hợp lệ.")
    .normalizeEmail();

/** Admin yêu cầu gửi OTP đến email mới. */
export const adminRequestChangeEmailValidator = [
  newEmailValidator(),
];

/** Admin xác nhận đổi email bằng OTP gửi đến email mới. */
export const adminVerifyChangeEmailValidator = [
  newEmailValidator(),
  otpValidator("otp"),
];

/* =========================================================
 * 6. CẬP NHẬT HỒ SƠ ADMIN
 * =========================================================
 *
 * Cho phép cập nhật từng phần:
 * - name: họ tên.
 * - phone: số điện thoại.
 * - avatar: file ảnh qua upload middleware.
 *
 * Email không được sửa ở đây vì đã có luồng đổi email bằng OTP.
 * Không cho cập nhật role, status, password hoặc userId.
 * =========================================================
 */

const ADMIN_PROFILE_FIELDS = ["name", "phone"] as const;

export const adminUpdateProfileValidator = [
  /** Kiểm tra họ tên nếu Admin gửi trường name. */
  body("name")
    .optional()
    .isString()
    .withMessage("Họ tên phải là chuỗi ký tự.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Họ tên không được để trống.")
    .bail()
    .isLength({ min: 2, max: 150 })
    .withMessage("Họ tên phải từ 2 đến 150 ký tự."),

  /** Kiểm tra số điện thoại nếu Admin gửi trường phone. */
  body("phone")
    .optional({ values: "null" })
    .isString()
    .withMessage("Số điện thoại phải là chuỗi ký tự.")
    .bail()
    .trim()
    .matches(PHONE_REGEX)
    .withMessage("Số điện thoại không đúng định dạng."),

  /**
   * Chặn các trường ngoài danh sách cho phép.
   * Cho phép cập nhật ảnh đơn lẻ thông qua req.file.
   */
  body().custom((_value, { req }) => {
    const bodyKeys = Object.keys(req.body ?? {});

    const unknownFields = bodyKeys.filter(
      (key) => !ADMIN_PROFILE_FIELDS.includes(key as "name" | "phone")
    );

    if (unknownFields.length > 0) {
      throw new Error(
        `Không được phép cập nhật các trường: ${unknownFields.join(", ")}.`
      );
    }

    const hasAllowedBodyField = bodyKeys.some((key) =>
      ADMIN_PROFILE_FIELDS.includes(key as "name" | "phone")
    );

    // Không phụ thuộc khai báo req.file của @types/multer.
    const requestWithFile = req as typeof req & {
      file?: unknown;
    };

    const hasUploadedAvatar = Boolean(requestWithFile.file);

    if (!hasAllowedBodyField && !hasUploadedAvatar) {
      throw new Error(
        "Vui lòng cung cấp ít nhất một thông tin cần cập nhật."
      );
    }

    return true;
  }),
];

/* =========================================================
 * 7. LẤY THÔNG TIN ADMIN HIỆN TẠI
 * =========================================================
 *
 * Không cần validator body nếu API không nhận dữ liệu đầu vào.
 *
 * Route bắt buộc có:
 * - Auth middleware: xác thực token.
 * - Admin role middleware: kiểm tra role === "admin".
 *
 * Không cần tạo validator rỗng chỉ để lấy thông tin hiện tại.
 * ========================================================= */

/**
 * LƯU Ý KHI TÍCH HỢP:
 * - Đặt upload middleware trước validator nếu cập nhật avatar.
 * - Upload middleware kiểm tra loại file và dung lượng.
 * - Service phải kiểm tra mật khẩu mới khác mật khẩu cũ.
 * - Service phải xác minh OTP trước khi đổi email hoặc reset mật khẩu.
 */