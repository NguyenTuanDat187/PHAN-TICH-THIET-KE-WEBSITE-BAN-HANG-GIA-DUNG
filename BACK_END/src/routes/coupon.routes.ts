import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";
import validate from "../middlewares/validate.middleware";
import {
  couponIdParamValidator,
  checkCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  adminCouponsQueryValidator,
} from "../validators/coupon.validator";
import * as couponController from "../controllers/coupon.controller";

const router = Router();

router.get("/public", couponController.getPublicCoupons);

router.post(
  "/check",
  authMiddleware,
  checkCouponValidator,
  validate,
  couponController.checkCoupon
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  adminCouponsQueryValidator,
  validate,
  couponController.getAllCouponsAdmin
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  couponIdParamValidator,
  validate,
  couponController.getCouponByIdAdmin
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createCouponValidator,
  validate,
  couponController.createCoupon
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateCouponValidator,
  validate,
  couponController.updateCoupon
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  couponIdParamValidator,
  validate,
  couponController.toggleCouponStatus
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  couponIdParamValidator,
  validate,
  couponController.deleteCoupon
);

router.get(
  "/admin/:id/usages",
  authMiddleware,
  roleMiddleware("admin"),
  couponIdParamValidator,
  validate,
  couponController.getCouponUsages
);

export default router;
