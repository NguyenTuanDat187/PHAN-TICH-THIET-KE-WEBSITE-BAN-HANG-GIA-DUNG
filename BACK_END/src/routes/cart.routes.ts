import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import {
  cartIdParamValidator,
  addToCartValidator,
  updateCartQuantityValidator,
} from "../validators/cart.validator";
import * as cartController from "../controllers/cart.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/", addToCartValidator, validate, cartController.addToCart);
router.put("/:id", updateCartQuantityValidator, validate, cartController.updateCartItem);
router.delete("/:id", cartIdParamValidator, validate, cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export default router;
