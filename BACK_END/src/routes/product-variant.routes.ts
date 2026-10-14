import { Router } from "express";

import {
  productIdParamValidator,
  variantIdParamValidator,
  createVariantValidator,
  updateVariantValidator,
  updateStockValidator,
} from "../validators/product-variant.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import * as variantController from "../controllers/product-variant.controller";

const router = Router();

router.get(
  "/products/:productId/variants",
  productIdParamValidator,
  validate,
  variantController.getPublicVariantsByProduct
);

router.get(
  "/variants/:id",
  variantIdParamValidator,
  validate,
  variantController.getPublicVariantById
);

router.get(
  "/admin/products/:productId/variants",
  authMiddleware,
  roleMiddleware("admin"),
  productIdParamValidator,
  validate,
  variantController.getAdminVariantsByProduct
);

router.post(
  "/admin/products/:productId/variants",
  authMiddleware,
  roleMiddleware("admin"),
  createVariantValidator,
  validate,
  variantController.createVariant
);

router.put(
  "/admin/variants/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateVariantValidator,
  validate,
  variantController.updateVariant
);

router.patch(
  "/admin/variants/:id/stock",
  authMiddleware,
  roleMiddleware("admin"),
  updateStockValidator,
  validate,
  variantController.updateVariantStock
);

router.patch(
  "/admin/variants/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  variantIdParamValidator,
  validate,
  variantController.toggleVariantStatus
);

router.delete(
  "/admin/variants/:id",
  authMiddleware,
  roleMiddleware("admin"),
  variantIdParamValidator,
  validate,
  variantController.deleteVariant
);

export default router;
