
/**
 * =========================================================
 * FILE: BACK_END/src/config/openai.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Khởi tạo OpenAI client.
 * - Đọc API key từ biến môi trường.
 * - Không ghi cứng API key trong source code.
 */

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Thiếu OPENAI_API_KEY trong file .env.",
  );
}

export const openai = new OpenAI({
  apiKey,
});

export const OPENAI_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1-mini";
