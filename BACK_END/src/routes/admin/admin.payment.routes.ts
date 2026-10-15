import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  adminPaymentsQueryValidator,
  refundValidator,
} from "../../validators/payment.validator";
import * as paymentController from "../../controllers/payment.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get(
  "/",
  adminPaymentsQueryValidator,
  validate,
  paymentController.getAllPaymentsAdmin
);

router.post(
  "/:id/refund",
  refundValidator,
  validate,
  paymentController.refundPaymentAdmin
);

export default router;
