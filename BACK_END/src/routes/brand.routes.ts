import { Router } from "express";

import {
  brandIdParamValidator,
  brandSlugParamValidator,
  createBrandValidator,
  updateBrandValidator,
  toggleBrandStatusValidator,
  queryBrandValidator,
} from "../validators/brand.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import * as brandController from "../controllers/brand.controller";

const router = Router();

// ================= PUBLIC ROUTES =================
router.get(
  "/",
  queryBrandValidator,
  validate,
  brandController.getPublicBrands,
);

router.get(
  "/slug/:slug",
  brandSlugParamValidator,
  validate,
  brandController.getPublicBrandBySlug,
);

// ================= ADMIN ROUTES =================
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  queryBrandValidator,
  validate,
  brandController.getAdminBrands,
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createBrandValidator,
  validate,
  brandController.createBrand,
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  brandIdParamValidator,
  validate,
  brandController.getAdminBrandById,
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateBrandValidator,
  validate,
  brandController.updateBrand,
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  toggleBrandStatusValidator,
  validate,
  brandController.toggleBrandStatus,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  brandIdParamValidator,
  validate,
  brandController.deleteBrand,
);

// GET /:id đặt cuối để không che các route /admin/*
router.get(
  "/:id",
  brandIdParamValidator,
  validate,
  brandController.getPublicBrandById,
);

export default router;
