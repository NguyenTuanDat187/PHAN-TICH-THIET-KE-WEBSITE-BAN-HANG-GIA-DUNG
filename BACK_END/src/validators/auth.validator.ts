/**
 * =========================================================
 * FILE: BACK_END/src/validators/auth.validator.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Kiểm tra dữ liệu đầu vào cho toàn bộ chức năng Authentication.
 * - Validator chạy trước Controller.
 * - Không xử lý database, bcrypt hoặc JWT tại đây.
 *
 * LUỒNG:
 *
 * Request
 *    ↓
 * Validator
 *    ↓
 * Controller
 *    ↓
 * Service
 *    ↓
 * Model
 *    ↓
 * MongoDB
 *
 * CÁC CHỨC NĂNG:
 * 1. Đăng ký tài khoản
 * 2. Xin OTP đăng ký
 * 3. Xác thực OTP đăng ký
 * 4. Đăng nhập
 * 5. Quên mật khẩu
 * 6. Reset mật khẩu
 * 7. Đổi mật khẩu
 *
 * LƯU Ý:
 * - Validator chỉ kiểm tra dữ liệu.
 * - Việc kiểm tra email đã tồn tại hay chưa sẽ thực hiện ở Service.
 * - Việc kiểm tra OTP đúng hay sai sẽ thực hiện ở OTP Controller/Service.
 * - Việc kiểm tra mật khẩu cũ có giống mật khẩu mới hay không sẽ thực hiện
 *   ở Auth Service vì cần lấy password hash từ MongoDB.
 * =========================================================
 */

import { body } from "express-validator";

/**
 * =========================================================
 * 1. REGEX EMAIL
 * =========================================================
 *
 * Kiểm tra email có cấu trúc cơ bản:
 * example@gmail.com
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * =========================================================
 * 2. REGEX SỐ ĐIỆN THOẠI
 * =========================================================
 *
 * Hỗ trợ số điện thoại Việt Nam:
 * - 0xxxxxxxxx
 * - +84xxxxxxxxx
 *
 * Ví dụ hợp lệ:
 * 0901234567
 * 0987654321
 * +84901234567
 */
const PHONE_REGEX = /^(0|\+84)[3-9][0-9]{8}$/;

/**
 * =========================================================
 * 3. REGEX MẬT KHẨU
 * =========================================================
 *
 * Mật khẩu yêu cầu:
 *
 * - Tối thiểu 8 ký tự
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 chữ thường
 * - Có ít nhất 1 chữ số
 * - Có ít nhất 1 ký tự đặc biệt
 *
 * Ví dụ:
 * Password@123
 *
 * Không hợp lệ:
 * password
 * password123
 * PASSWORD123
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

/**
 * =========================================================
 * 4. REGEX OTP
 * =========================================================
 *
 * OTP của hệ thống gồm đúng 6 chữ số.
 *
 * Ví dụ:
 * 123456
 * 908172
 */
const OTP_REGEX = /^\d{6}$/;

/**
 * =========================================================
 * 5. VALIDATOR EMAIL
 * =========================================================
 *
 * Dùng chung cho:
 * - Đăng ký xin OTP
 * - Xác thực OTP đăng ký
 * - Đăng nhập
 * - Quên mật khẩu
 *
 * Không kiểm tra email có tồn tại trong database hay không.
 * Việc đó thuộc Service.
 */
const emailValidator = () =>
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc.")
    .isEmail()
    .withMessage("Email không đúng định dạng.")
    .matches(EMAIL_REGEX)
    .withMessage("Email không hợp lệ.")
    .normalizeEmail();

/**
 * =========================================================
 * 6. VALIDATOR OTP
 * =========================================================
 *
 * Kiểm tra OTP:
 * - Không được bỏ trống
 * - Phải có đúng 6 chữ số
 *
 * Không kiểm tra OTP có đúng với OTP đã gửi hay không.
 */
const otpValidator = () =>
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP là bắt buộc.")
    .matches(OTP_REGEX)
    .withMessage("OTP phải gồm đúng 6 chữ số.");

/**
 * =========================================================
 * 7. VALIDATOR PASSWORD
 * =========================================================
 *
 * Dùng cho password khi:
 * - Đăng ký
 * - Reset password
 * - Đổi password
 */
const passwordValidator = (fieldName = "password") =>
  body(fieldName)
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc.")
    .isString()
    .withMessage("Mật khẩu phải là chuỗi ký tự.")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
    );

/**
 * =========================================================
 * 8. VALIDATOR HỌ TÊN
 * =========================================================
 *
 * Kiểm tra tên:
 * - Bắt buộc
 * - Là chuỗi
 * - Tối thiểu 2 ký tự
 * - Tối đa 150 ký tự
 *
 * trim() giúp loại bỏ khoảng trắng đầu/cuối.
 */
const nameValidator = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Họ tên là bắt buộc.")
    .isString()
    .withMessage("Họ tên phải là chuỗi ký tự.")
    .isLength({ min: 2, max: 150 })
    .withMessage("Họ tên phải từ 2 đến 150 ký tự.");

/**
 * =========================================================
 * 9. VALIDATOR SỐ ĐIỆN THOẠI
 * =========================================================
 *
 * Số điện thoại là trường không bắt buộc.
 *
 * Nếu người dùng nhập thì phải đúng định dạng.
 */
const phoneValidator = () =>
  body("phone")
    .optional({ values: "null" })
    .trim()
    .matches(PHONE_REGEX)
    .withMessage("Số điện thoại không đúng định dạng.");

/**
 * =========================================================
 * 10. XIN OTP ĐĂNG KÝ
 * =========================================================
 *
 * BƯỚC:
 *
 * User nhập email
 *       ↓
 * Validate email
 *       ↓
 * Controller kiểm tra email trong database
 *       ↓
 * Gửi OTP
 *
 * Chưa tạo User ở bước này.
 */
export const requestRegisterOtpValidator = [emailValidator()];

/**
 * =========================================================
 * 11. XÁC THỰC OTP ĐĂNG KÝ
 * =========================================================
 *
 * User nhập:
 * - Email
 * - OTP
 *
 * Nếu OTP đúng:
 * → Backend đánh dấu email đã xác thực.
 *
 * Sau đó frontend mới cho người dùng nhập:
 * - Họ tên
 * - Số điện thoại
 * - Mật khẩu
 */
export const verifyRegisterOtpValidator = [
  emailValidator(),
  otpValidator(),
];

/**
 * =========================================================
 * 12. HOÀN TẤT ĐĂNG KÝ
 * =========================================================
 *
 * Sau khi OTP đã được xác thực:
 *
 * User nhập:
 * - Email
 * - Họ tên
 * - Số điện thoại
 * - Mật khẩu
 * - Xác nhận mật khẩu
 *
 * Validator kiểm tra toàn bộ dữ liệu trước khi
 * Controller/Service tạo User.
 */
export const registerValidator = [
  emailValidator(),

  nameValidator(),

  phoneValidator(),

  passwordValidator("password"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Xác nhận mật khẩu là bắt buộc.")
    .isString()
    .withMessage("Xác nhận mật khẩu phải là chuỗi ký tự.")
    .custom((confirmPassword, { req }) => {
      /**
       * Kiểm tra password và confirmPassword giống nhau.
       *
       * Lưu ý:
       * Đây chỉ là kiểm tra dữ liệu đầu vào.
       * Service vẫn phải xử lý password bằng bcrypt.
       */
      if (confirmPassword !== req.body.password) {
        throw new Error("Mật khẩu xác nhận không khớp.");
      }

      return true;
    }),
];

/**
 * =========================================================
 * 13. ĐĂNG NHẬP
 * =========================================================
 *
 * User nhập:
 * - Email
 * - Password
 *
 * Validator chỉ kiểm tra dữ liệu có đúng format hay không.
 *
 * Không kiểm tra:
 * - User có tồn tại không
 * - Password có đúng không
 * - User có bị blocked không
 *
 * Những việc trên thuộc Auth Service.
 */
export const loginValidator = [
  emailValidator(),

  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc.")
    .isString()
    .withMessage("Mật khẩu phải là chuỗi ký tự."),
];

/**
 * =========================================================
 * 14. XIN OTP RESET PASSWORD
 * =========================================================
 *
 * User chỉ cần nhập email.
 *
 * Sau đó Service sẽ:
 * - Tìm User
 * - Kiểm tra status
 * - Gửi OTP
 *
 * Áp dụng cho:
 * - Customer
 * - Admin
 */
export const forgotPasswordValidator = [emailValidator()];

/**
 * =========================================================
 * 15. RESET PASSWORD
 * =========================================================
 *
 * User gửi:
 * - Email
 * - OTP
 * - Mật khẩu mới
 * - Xác nhận mật khẩu mới
 *
 * Flow:
 *
 * Validator
 *     ↓
 * Verify OTP
 *     ↓
 * Kiểm tra password mới
 *     ↓
 * Kiểm tra password mới khác password cũ
 *     ↓
 * Hash password
 *     ↓
 * Update User
 */
export const resetPasswordValidator = [
  emailValidator(),

  otpValidator(),

  passwordValidator("newPassword"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Xác nhận mật khẩu mới là bắt buộc.")
    .isString()
    .withMessage("Xác nhận mật khẩu mới phải là chuỗi ký tự.")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.newPassword) {
        throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      }

      return true;
    }),
];

/**
 * =========================================================
 * 16. ĐỔI PASSWORD KHI ĐÃ ĐĂNG NHẬP
 * =========================================================
 *
 * User đã đăng nhập và muốn đổi mật khẩu.
 *
 * Gửi:
 * - currentPassword
 * - newPassword
 * - confirmPassword
 *
 * Validator không kiểm tra currentPassword có đúng hay không.
 * Auth Service sẽ dùng bcrypt.compare() để kiểm tra.
 */
export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Mật khẩu hiện tại là bắt buộc.")
    .isString()
    .withMessage("Mật khẩu hiện tại phải là chuỗi ký tự."),

  passwordValidator("newPassword"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Xác nhận mật khẩu mới là bắt buộc.")
    .isString()
    .withMessage("Xác nhận mật khẩu mới phải là chuỗi ký tự.")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.newPassword) {
        throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      }

      return true;
    }),
];

/**
 * =========================================================
 * EXPORT REGEX
 * =========================================================
 *
 * Export để sau này nếu cần dùng lại ở file khác
 * thì không phải viết lại regex.
 */
export {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  OTP_REGEX,
};