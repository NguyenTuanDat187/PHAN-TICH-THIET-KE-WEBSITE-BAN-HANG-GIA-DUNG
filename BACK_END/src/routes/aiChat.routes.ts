
/**
 * FILE: BACK_END/src/routes/aiChat.routes.ts
 *
 * NHIỆM VỤ:
 * - Đăng ký các endpoint của AI Chat.
 */

import { Router, Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import {
  createAIConversationController,
  deleteAIConversationController,
  getAIConversationByIdController,
  getAIConversationsController,
  sendAIChatController,
} from "../controllers/aiChat.controller";

import {
  conversationIdParamValidator,
  conversationSessionQueryValidator,
  createAIConversationValidator,
  sendAIChatValidator,
} from "../validators/aiChat.validator";

const router = Router();

/**
 * Middleware xử lý lỗi validation.
 */
const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu gửi lên không hợp lệ.",
      errors: errors.array().map((error) => ({
        field: "path" in error ? error.path : undefined,
        message: error.msg,
      })),
    });
    return;
  }

  next();
};

// POST /api/ai/chat
router.post(
  "/chat",
  sendAIChatValidator,
  validate,
  sendAIChatController,
);

// POST /api/ai/chat/conversations
router.post(
  "/chat/conversations",
  createAIConversationValidator,
  validate,
  createAIConversationController,
);

// GET /api/ai/chat/conversations
router.get(
  "/chat/conversations",
  conversationSessionQueryValidator,
  validate,
  getAIConversationsController,
);

// GET /api/ai/chat/conversations/:id
router.get(
  "/chat/conversations/:id",
  conversationIdParamValidator,
  validate,
  getAIConversationByIdController,
);

// DELETE /api/ai/chat/conversations/:id
router.delete(
  "/chat/conversations/:id",
  conversationIdParamValidator,
  validate,
  deleteAIConversationController,
);

export default router;
