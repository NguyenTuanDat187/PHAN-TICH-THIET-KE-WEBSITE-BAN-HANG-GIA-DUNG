import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import validate from "../../middlewares/validate.middleware";
import { adminOrderItemsQueryValidator } from "../../validators/order-item.validator";
import * as orderItemController from "../../controllers/order-item.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get(
  "/",
  adminOrderItemsQueryValidator,
  validate,
  orderItemController.getAllOrderItemsAdmin
);

export default router;
