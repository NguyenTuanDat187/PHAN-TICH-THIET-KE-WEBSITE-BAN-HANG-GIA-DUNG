import { Router } from "express";

import {
  productIdParamValidator,
  productSlugParamValidator,
  createProductValidator,
  updateProductValidator,
  toggleProductStatusValidator,
  toggleProductFeaturedValidator,
  queryProductValidator,
} from "../validators/product.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import * as productController from "../controllers/product.controller";

const router = Router();

router.get(
  "/",
  queryProductValidator,
  validate,
  productController.getPublicProducts,
);

router.get("/featured", productController.getFeaturedProducts);

router.get(
  "/related/:id",
  productIdParamValidator,
  validate,
  productController.getRelatedProducts,
);

router.get(
  "/slug/:slug",
  productSlugParamValidator,
  validate,
  productController.getPublicProductBySlug,
);

router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  queryProductValidator,
  validate,
  productController.getAdminProducts,
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createProductValidator,
  validate,
  productController.createProduct,
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  productIdParamValidator,
  validate,
  productController.getAdminProductById,
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateProductValidator,
  validate,
  productController.updateProduct,
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  toggleProductStatusValidator,
  validate,
  productController.toggleProductStatus,
);

router.patch(
  "/admin/:id/featured",
  authMiddleware,
  roleMiddleware("admin"),
  toggleProductFeaturedValidator,
  validate,
  productController.toggleProductFeatured,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  productIdParamValidator,
  validate,
  productController.deleteProduct,
);

router.get(
  "/:id",
  productIdParamValidator,
  validate,
  productController.getPublicProductDetail,
);

export default router;
