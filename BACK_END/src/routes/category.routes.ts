import { Router } from "express";

import {
  categoryIdParamValidator,
  categorySlugParamValidator,
  createCategoryValidator,
  updateCategoryValidator,
  toggleCategoryStatusValidator,
  updateSortOrderValidator,
  queryCategoryValidator,
} from "../validators/category.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import * as categoryController from "../controllers/category.controller";

const router = Router();

// ================= PUBLIC ROUTES =================
router.get(
  "/",
  queryCategoryValidator,
  validate,
  categoryController.getPublicCategories,
);

router.get("/tree", categoryController.getPublicCategoryTree);

router.get(
  "/slug/:slug",
  categorySlugParamValidator,
  validate,
  categoryController.getPublicCategoryBySlug,
);

// ================= ADMIN ROUTES =================
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  queryCategoryValidator,
  validate,
  categoryController.getAdminCategories,
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createCategoryValidator,
  validate,
  categoryController.createCategory,
);

router.put(
  "/admin/sort-order",
  authMiddleware,
  roleMiddleware("admin"),
  updateSortOrderValidator,
  validate,
  categoryController.updateSortOrder,
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryIdParamValidator,
  validate,
  categoryController.getAdminCategoryById,
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateCategoryValidator,
  validate,
  categoryController.updateCategory,
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  toggleCategoryStatusValidator,
  validate,
  categoryController.toggleCategoryStatus,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryIdParamValidator,
  validate,
  categoryController.deleteCategory,
);

// GET /:id đặt cuối để không che các route /admin/*, /tree, /slug/*
router.get(
  "/:id",
  categoryIdParamValidator,
  validate,
  categoryController.getPublicCategoryById,
);

export default router;
