/**
 * =========================================================
 * FILE: BACK_END/src/config/gemini.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Khởi tạo Google Gemini SDK.
 * - Đọc API key từ biến môi trường.
 * - Cung cấp model dùng để phân tích câu tìm kiếm sản phẩm.
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Thiếu GEMINI_API_KEY trong file .env.",
  );
}

export const gemini = new GoogleGenAI({
  apiKey,
});

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";