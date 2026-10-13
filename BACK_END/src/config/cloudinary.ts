
/**
 * =========================================================
 * FILE: BACK_END/src/config/cloudinary.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Cấu hình kết nối Cloudinary.
 * - Đọc thông tin kết nối từ file .env.
 * - Không viết trực tiếp API Secret trong source code.
 * =========================================================
 */

import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary bằng biến môi trường.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
