/**
 * =========================================================
 * FILE: BACK_END/src/config/mail.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Cấu hình gửi email bằng Nodemailer.
 * - Kết nối Gmail SMTP.
 * - Gửi OTP đăng ký / reset mật khẩu.
 * - Có LOG chi tiết để debug lỗi SMTP.
 *
 * =========================================================
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * =========================================================
 * ĐỌC ENV
 * =========================================================
 */

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;

/**
 * =========================================================
 * LOG CẤU HÌNH MAIL
 * =========================================================
 *
 * KHÔNG in password thật ra console.
 */

console.log("");
console.log("=================================================");
console.log("📧 KIỂM TRA CẤU HÌNH EMAIL");
console.log("=================================================");
console.log("MAIL_HOST:", MAIL_HOST);
console.log("MAIL_PORT:", MAIL_PORT);
console.log("MAIL_USER:", MAIL_USER);
console.log("MAIL_FROM:", MAIL_FROM);
console.log(
  "MAIL_PASSWORD:",
  MAIL_PASSWORD
    ? `ĐÃ CÓ (${MAIL_PASSWORD.length} ký tự)`
    : "❌ CHƯA CÓ"
);
console.log("=================================================");
console.log("");

/**
 * =========================================================
 * KIỂM TRA ENV
 * =========================================================
 */

if (
  !MAIL_HOST ||
  !MAIL_USER ||
  !MAIL_PASSWORD ||
  !MAIL_FROM
) {
  console.error(
    "❌ CẤU HÌNH EMAIL CHƯA ĐẦY ĐỦ!"
  );
}

/**
 * =========================================================
 * NODEMAILER TRANSPORTER
 * =========================================================
 */

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,

  /**
   * Port 587:
   * - secure = false
   * - sử dụng STARTTLS
   *
   * Port 465:
   * - secure = true
   */
  secure: MAIL_PORT === 465,

  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },

  /**
   * =======================================================
   * DEBUG NODEMAILER
   * =======================================================
   *
   * true:
   * - Hiển thị quá trình SMTP.
   *
   * logger:
   * - Hiển thị log SMTP ra terminal.
   *
   * Chỉ nên bật khi DEBUG.
   */

  debug: true,
  logger: true,
});

/**
 * =========================================================
 * KIỂM TRA KẾT NỐI SMTP
 * =========================================================
 */

export const verifyMailConnection =
  async (): Promise<void> => {
    console.log("");
    console.log("=================================================");
    console.log("🔍 ĐANG KIỂM TRA KẾT NỐI GMAIL SMTP...");
    console.log("=================================================");
    console.log("SMTP HOST:", MAIL_HOST);
    console.log("SMTP PORT:", MAIL_PORT);
    console.log("SMTP USER:", MAIL_USER);
    console.log(
      "SMTP PASSWORD:",
      MAIL_PASSWORD
        ? "ĐÃ CÓ"
        : "❌ CHƯA CÓ"
    );
    console.log("=================================================");

    try {
      await transporter.verify();

      console.log("");
      console.log("=================================================");
      console.log("✅ SMTP CONNECTION SUCCESSFUL");
      console.log("=================================================");
      console.log(
        "Gmail SMTP đã xác thực thành công."
      );
      console.log("=================================================");
      console.log("");
    } catch (error: any) {
      console.error("");
      console.error("=================================================");
      console.error("❌ SMTP CONNECTION FAILED");
      console.error("=================================================");

      console.error("ERROR NAME:", error?.name);
      console.error("ERROR CODE:", error?.code);
      console.error(
        "ERROR COMMAND:",
        error?.command
      );
      console.error(
        "ERROR RESPONSE CODE:",
        error?.responseCode
      );
      console.error(
        "ERROR RESPONSE:",
        error?.response
      );
      console.error(
        "ERROR MESSAGE:",
        error?.message
      );

      console.error("=================================================");
      console.error("");
    }
  };

/**
 * =========================================================
 * GỬI OTP
 * =========================================================
 */

export const sendOtpEmail = async (
  email: string,
  otp: string,
  type: "register" | "reset_password",
): Promise<void> => {
  console.log("");
  console.log("=================================================");
  console.log("📨 BẮT ĐẦU GỬI EMAIL OTP");
  console.log("=================================================");

  console.log("Người nhận:", email);
  console.log("Loại OTP:", type);

  /**
   * Không nên log OTP trong production.
   *
   * Nhưng khi DEBUG local thì có thể log để kiểm tra.
   */
  console.log("OTP:", otp);

  console.log("MAIL_FROM:", MAIL_FROM);
  console.log("SMTP_HOST:", MAIL_HOST);
  console.log("SMTP_PORT:", MAIL_PORT);

  console.log("=================================================");

  const isRegister =
    type === "register";

  const subject = isRegister
    ? "Mã OTP xác thực đăng ký tài khoản"
    : "Mã OTP đặt lại mật khẩu";

  const title = isRegister
    ? "Xác thực đăng ký tài khoản"
    : "Đặt lại mật khẩu";

  const description = isRegister
    ? "Bạn đang thực hiện đăng ký tài khoản. Vui lòng sử dụng mã OTP bên dưới để xác thực email."
    : "Bạn đang thực hiện đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới để tiếp tục.";

  try {
    console.log("📤 Đang gọi transporter.sendMail()...");

    const info = await transporter.sendMail({
      from: `"Gia Dụng Store" <${MAIL_FROM}>`,
      to: email,
      subject,

      text: `
${title}

${description}

Mã OTP của bạn: ${otp}

Mã OTP có hiệu lực trong 5 phút.

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.

Trân trọng,

Gia Dụng Store
      `.trim(),

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
            background-color: #f7f7f7;
          "
        >
          <div
            style="
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
            "
          >
            <h2>${title}</h2>

            <p>
              ${description}
            </p>

            <div
              style="
                margin: 25px 0;
                padding: 20px;
                text-align: center;
                background-color: #f1f1f1;
                border-radius: 10px;
              "
            >
              <div
                style="
                  font-size: 13px;
                  color: #666;
                  margin-bottom: 8px;
                "
              >
                MÃ OTP
              </div>

              <div
                style="
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                "
              >
                ${otp}
              </div>
            </div>

            <p>
              <strong>Thời hạn:</strong>
              5 phút.
            </p>

            <p>
              Nếu bạn không thực hiện yêu cầu này,
              vui lòng bỏ qua email.
            </p>

            <hr />

            <p
              style="
                font-size: 12px;
                color: #777;
              "
            >
              Đây là email tự động.
              Vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
    });

    console.log("");
    console.log("=================================================");
    console.log("✅ GỬI EMAIL THÀNH CÔNG");
    console.log("=================================================");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);
    console.log("=================================================");
    console.log("");
  } catch (error: any) {
    console.error("");
    console.error("=================================================");
    console.error("❌ GỬI EMAIL THẤT BẠI");
    console.error("=================================================");

    console.error("ERROR NAME:", error?.name);
    console.error("ERROR CODE:", error?.code);
    console.error(
      "ERROR COMMAND:",
      error?.command
    );
    console.error(
      "ERROR RESPONSE CODE:",
      error?.responseCode
    );
    console.error(
      "ERROR RESPONSE:",
      error?.response
    );
    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error("=================================================");
    console.error("");

    throw error;
  }
};

export default transporter;