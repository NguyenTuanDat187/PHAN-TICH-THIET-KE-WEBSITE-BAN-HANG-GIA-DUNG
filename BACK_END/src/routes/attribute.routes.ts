import { Router } from "express";

import {
  attributeIdParamValidator,
  attributeValueIdParamValidator,
  createAttributeValidator,
  updateAttributeValidator,
  createAttributeValueValidator,
  updateAttributeValueValidator,
} from "../validators/attribute.validator";

import validate from "../middlewares/validate.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import * as attributeController from "../controllers/attribute.controller";

const router = Router();

router.get("/", attributeController.getAllAttributes);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createAttributeValidator,
  validate,
  attributeController.createAttribute,
);

router.put(
  "/admin/values/:valueId",
  authMiddleware,
  roleMiddleware("admin"),
  updateAttributeValueValidator,
  validate,
  attributeController.updateAttributeValue,
);

router.delete(
  "/admin/values/:valueId",
  authMiddleware,
  roleMiddleware("admin"),
  attributeValueIdParamValidator,
  validate,
  attributeController.deleteAttributeValue,
);

router.post(
  "/admin/:id/values",
  authMiddleware,
  roleMiddleware("admin"),
  createAttributeValueValidator,
  validate,
  attributeController.createAttributeValue,
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAttributeValidator,
  validate,
  attributeController.updateAttribute,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  attributeIdParamValidator,
  validate,
  attributeController.deleteAttribute,
);

router.get(
  "/:id",
  attributeIdParamValidator,
  validate,
  attributeController.getAttributeById,
);

export default router;
