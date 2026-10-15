import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { orderIdParamValidator } from "../validators/order-item.validator";
import * as orderItemController from "../controllers/order-item.controller";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:id/items",
  orderIdParamValidator,
  validate,
  orderItemController.getOrderItems
);

export default router;
