/**
 * =========================================================
 * FILE: BACK_END/src/middlewares/upload.middleware.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Nhận file ảnh từ request.
 * - Phục vụ chức năng upload avatar Customer và Admin.
 * - Giới hạn dung lượng file.
 * - Chỉ chấp nhận các định dạng ảnh thông dụng.
 *
 * LƯU Ý:
 * - File được lưu tạm trong bộ nhớ.
 * - File này chưa lưu ảnh lên Cloudinary hoặc ổ đĩa.
 * - Middleware chỉ tiếp nhận và kiểm tra file.
 *
 * =========================================================
 */

import multer from "multer";

/**
 * =========================================================
 * CẤU HÌNH MULTER
 * =========================================================
 *
 * memoryStorage:
 * - File được lưu trong RAM dưới dạng Buffer.
 * - Có thể dùng req.file.buffer để upload lên dịch vụ lưu ảnh.
 *
 * =========================================================
 */

const storage = multer.memoryStorage();

/**
 * =========================================================
 * KIỂM TRA ĐỊNH DẠNG ẢNH
 * =========================================================
 */

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        "Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP hoặc GIF.",
      ),
    );
  }

  callback(null, true);
};

/**
 * =========================================================
 * KHỞI TẠO MULTER
 * =========================================================
 */

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5 MB
    files: 1, // Chỉ nhận một file
  },
});

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export default uploadMiddleware;