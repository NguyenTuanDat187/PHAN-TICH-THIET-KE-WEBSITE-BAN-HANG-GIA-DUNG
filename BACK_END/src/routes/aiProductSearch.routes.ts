
/**
 * =========================================================
 * FILE: BACK_END/src/routes/aiProductSearch.routes.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Khai báo API tìm kiếm sản phẩm bằng AI.
 * - Gắn validator trước controller.
 */

import { Router } from "express";

import {
  aiProductSearchController,
} from "../controllers/aiProductSearch.controller";

import {
  aiProductSearchValidator,
} from "../validators/aiProductSearch.validator";

const router = Router();

router.post(
  "/search",
  aiProductSearchValidator,
  aiProductSearchController,
);

export default router;
