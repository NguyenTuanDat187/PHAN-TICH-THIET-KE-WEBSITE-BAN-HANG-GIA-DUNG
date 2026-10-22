
/**
 * =========================================================
 * FILE: BACK_END/src/controllers/aiChat.controller.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Nhận request từ client.
 * - Lấy thông tin người dùng hoặc phiên chat.
 * - Gọi service xử lý AI Chat.
 * - Trả response JSON về client.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import {
  createAIConversation,
  deleteAIConversation,
  getAIConversationById,
  getAIConversations,
  sendAIChatMessage,
} from "../services/aiChat.service";

/**
 * ---------------------------------------------------------
 * LẤY THÔNG TIN NGƯỜI DÙNG HOẶC PHIÊN CHAT
 * ---------------------------------------------------------
 *
 * - Nếu đã đăng nhập: lấy userId từ req.user.
 * - Nếu chưa đăng nhập: lấy sessionId từ body hoặc query.
 *
 * LƯU Ý:
 * Kiểu req.user phải khớp với kiểu được khai báo trong
 * auth.middleware.ts.
 */
const getIdentity = (req: Request) => {
  // Lấy userId theo đúng cấu trúc req.user của middleware.
  const userId = req.user?.userId;

  // Ưu tiên sessionId trong body, sau đó đến query.
  const bodySessionId = req.body?.sessionId;
  const querySessionId = req.query?.sessionId;

  const sessionId =
    typeof bodySessionId === "string"
      ? bodySessionId.trim()
      : typeof querySessionId === "string"
        ? querySessionId.trim()
        : undefined;

  return {
    userId,
    sessionId,
  };
};

/**
 * ---------------------------------------------------------
 * KIỂM TRA KẾT QUẢ VALIDATOR
 * ---------------------------------------------------------
 */
const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return true;
  }

  res.status(400).json({
    success: false,
    message: "Dữ liệu gửi lên không hợp lệ.",
    errors: errors.array().map((error) => ({
      field: "path" in error ? error.path : undefined,
      message: error.msg,
    })),
  });

  return false;
};

/**
 * ---------------------------------------------------------
 * 1. GỬI TIN NHẮN CHAT AI
 * ---------------------------------------------------------
 *
 * POST /api/ai/chat
 */
export const sendAIChatController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!validateRequest(req, res)) return;

    const identity = getIdentity(req);

    const data = await sendAIChatMessage({
      message: req.body.message,
      conversationId: req.body.conversationId,
      sessionId: identity.sessionId,
      userId: identity.userId,
    });

    res.status(200).json({
      success: true,
      message: "Gửi tin nhắn thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * 2. TẠO CUỘC TRÒ CHUYỆN MỚI
 * ---------------------------------------------------------
 *
 * POST /api/ai/chat/conversations
 */
export const createAIConversationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!validateRequest(req, res)) return;

    const identity = getIdentity(req);

    const data = await createAIConversation(
      identity.userId,
      identity.sessionId,
    );

    res.status(201).json({
      success: true,
      message: "Tạo cuộc trò chuyện thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * 3. LẤY DANH SÁCH CUỘC TRÒ CHUYỆN
 * ---------------------------------------------------------
 *
 * GET /api/ai/chat/conversations
 */
export const getAIConversationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!validateRequest(req, res)) return;

    const identity = getIdentity(req);

    const data = await getAIConversations(
      identity.userId,
      identity.sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách cuộc trò chuyện thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * 4. LẤY CHI TIẾT CUỘC TRÒ CHUYỆN
 * ---------------------------------------------------------
 *
 * GET /api/ai/chat/conversations/:id
 */
export const getAIConversationByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!validateRequest(req, res)) return;

    const identity = getIdentity(req);

    // Kiểu ParamsRequest khai báo id là string.
    const conversationId = req.params.id;

    const data = await getAIConversationById(
      conversationId,
      identity.userId,
      identity.sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử trò chuyện thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * 5. XÓA CUỘC TRÒ CHUYỆN
 * ---------------------------------------------------------
 *
 * DELETE /api/ai/chat/conversations/:id
 */
export const deleteAIConversationController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!validateRequest(req, res)) return;

    const identity = getIdentity(req);

    const conversationId = req.params.id;

    const data = await deleteAIConversation(
      conversationId,
      identity.userId,
      identity.sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Xóa cuộc trò chuyện thành công.",
      data,
    });
  } catch (error) {
    next(error);
  }
};
