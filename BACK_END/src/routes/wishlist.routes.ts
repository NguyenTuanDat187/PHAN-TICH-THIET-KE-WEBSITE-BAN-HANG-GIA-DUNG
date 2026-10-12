import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import {
  wishlistIdParamValidator,
  productIdParamValidator,
  addToWishlistValidator,
  moveToCartValidator,
} from "../validators/wishlist.validator";
import * as wishlistController from "../controllers/wishlist.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", wishlistController.getWishlist);
router.post("/", addToWishlistValidator, validate, wishlistController.addToWishlist);
router.get(
  "/check/:productId",
  productIdParamValidator,
  validate,
  wishlistController.checkWishlistStatus
);
router.post("/:id/move-to-cart", moveToCartValidator, validate, wishlistController.moveToCart);
router.delete(
  "/product/:productId",
  productIdParamValidator,
  validate,
  wishlistController.removeByProductId
);
router.delete("/:id", wishlistIdParamValidator, validate, wishlistController.removeFromWishlist);
router.delete("/", wishlistController.clearWishlist);

export default router;
