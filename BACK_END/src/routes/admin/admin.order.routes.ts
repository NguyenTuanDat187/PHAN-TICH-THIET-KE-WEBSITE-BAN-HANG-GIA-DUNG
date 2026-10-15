import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  orderIdParamValidator,
  adminOrdersQueryValidator,
  updateOrderStatusValidator,
} from "../../validators/order.validator";
import * as orderController from "../../controllers/order.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", adminOrdersQueryValidator, validate, orderController.getAllOrdersAdmin);

router.get("/:id", orderIdParamValidator, validate, orderController.getOrderDetailAdmin);

router.put(
  "/:id/status",
  updateOrderStatusValidator,
  validate,
  orderController.updateOrderStatusAdmin
);

export default router;
