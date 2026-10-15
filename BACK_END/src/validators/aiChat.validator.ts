
/**
 * FILE: BACK_END/src/validators/aiChat.validator.ts
 *
 * NHIỆM VỤ:
 * - Kiểm tra nội dung tin nhắn.
 * - Kiểm tra conversationId và sessionId.
 */

import { body, param, query } from "express-validator";

export const sendAIChatValidator = [
  body("message")
    .isString()
    .withMessage("Tin nhắn phải là chuỗi.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập nội dung tin nhắn.")
    .bail()
    .isLength({ max: 2000 })
    .withMessage("Tin nhắn không được vượt quá 2000 ký tự."),

  body("conversationId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("conversationId không hợp lệ."),

  body("sessionId")
    .optional({ nullable: true })
    .isString()
    .withMessage("sessionId phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ min: 16, max: 128 })
    .withMessage("sessionId phải dài từ 16 đến 128 ký tự."),
];

export const createAIConversationValidator = [
  body("sessionId")
    .optional({ nullable: true })
    .isString()
    .withMessage("sessionId phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ min: 16, max: 128 })
    .withMessage("sessionId phải dài từ 16 đến 128 ký tự."),
];

export const conversationIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("ID cuộc trò chuyện không hợp lệ."),
];

export const conversationSessionQueryValidator = [
  query("sessionId")
    .optional()
    .isString()
    .withMessage("sessionId phải là chuỗi.")
    .bail()
    .trim()
    .isLength({ min: 16, max: 128 })
    .withMessage("sessionId phải dài từ 16 đến 128 ký tự."),
];
