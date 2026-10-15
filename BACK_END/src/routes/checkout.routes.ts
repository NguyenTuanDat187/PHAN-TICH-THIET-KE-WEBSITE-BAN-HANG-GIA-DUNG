import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import {
  checkoutPreviewValidator,
  checkoutValidator,
} from "../validators/checkout.validator";
import * as checkoutController from "../controllers/checkout.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/preview",
  checkoutPreviewValidator,
  validate,
  checkoutController.previewCheckout
);

router.post("/", checkoutValidator, validate, checkoutController.submitCheckout);

export default router;
