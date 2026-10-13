
/**
 * =========================================================
 * FILE: BACK_END/src/services/upload.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Nhận file ảnh từ Multer memoryStorage.
 * - Upload ảnh lên Cloudinary.
 * - Trả về URL HTTPS để lưu vào MongoDB.
 *
 * LƯU Ý:
 * - Không lưu Buffer ảnh vào MongoDB.
 * - Không lưu ảnh vào ổ đĩa backend.
 * - Chỉ trả về URL khi upload thành công.
 * =========================================================
 */

import type { Express } from "express";
import cloudinary from "../config/cloudinary";

/**
 * Upload một file ảnh lên Cloudinary.
 *
 * @param file File ảnh được Multer nhận vào RAM.
 * @param folder Thư mục ảnh trên Cloudinary.
 * @returns URL HTTPS của ảnh sau khi upload.
 */
export const uploadImageService = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  // Kiểm tra file đầu vào.
  if (!file) {
    throw new Error("Vui lòng chọn ảnh cần tải lên.");
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new Error("Dữ liệu ảnh không hợp lệ.");
  }

  // Upload Buffer trực tiếp từ RAM lên Cloudinary.
  const result = await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Cloudinary tự tạo tên file duy nhất.
        use_filename: false,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error) {
          return reject(
            new Error("Không thể tải ảnh lên Cloudinary."),
          );
        }

        if (!uploadResult?.secure_url) {
          return reject(
            new Error("Cloudinary không trả về URL ảnh."),
          );
        }

        resolve(uploadResult.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });

  return result;
};
