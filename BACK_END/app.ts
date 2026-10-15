
// FILE: BACK_END/src/app.ts

import express from "express";
import cors from "cors";

/**
 * 1. AUTH ROUTES ĐÃ TÁCH
 */
import customerRoutes from "./src/routes/customer.routes";
import adminRoutes from "./src/routes/admin.routes";

/**
 * 2. STATISTICS ROUTES
 */
import customerStatisticsRoutes from "./src/routes/statistics/customer.statistics.routes";
import adminStatisticsRoutes from "./src/routes/statistics/admin.statistics.routes";

/**
 * 3. CÁC ROUTES NGHIỆP VỤ
 */
import brandRoutes from "./src/routes/brand.routes";
import categoryRoutes from "./src/routes/category.routes";
import attributeRoutes from "./src/routes/attribute.routes";
import productRoutes from "./src/routes/product.routes";
import productVariantRoutes from "./src/routes/product-variant.routes";
import productMediaRoutes from "./src/routes/product-media.routes";
import cartRoutes from "./src/routes/cart.routes";
import wishlistRoutes from "./src/routes/wishlist.routes";
import couponRoutes from "./src/routes/coupon.routes";
import userAddressRoutes from "./src/routes/userAddress.routes";
import adminCustomerRoutes from "./src/routes/admin/admin.customer.routes";
import checkoutRoutes from "./src/routes/checkout.routes";
import orderRoutes from "./src/routes/order.routes";
import orderItemRoutes from "./src/routes/order-item.routes";
import adminOrderRoutes from "./src/routes/admin/admin.order.routes";
import adminOrderItemRoutes from "./src/routes/admin/admin.order-item.routes";
import paymentRoutes from "./src/routes/payment.routes";
import adminPaymentRoutes from "./src/routes/admin/admin.payment.routes";
import aiProductSearchRoutes from "./src/routes/aiProductSearch.routes";


/**
 * 4. ERROR MIDDLEWARE
 */
import errorMiddleware from "./src/middlewares/error.middleware";

/**
 * 5. KHỞI TẠO EXPRESS APP
 */
const app = express();

/**
 * 6. GLOBAL MIDDLEWARE
 */

// Cấu hình CORS.
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Cho phép nhận dữ liệu JSON.
app.use(express.json());

// Cho phép nhận dữ liệu URL-encoded.
app.use(
  express.urlencoded({
    extended: true,
  }),
);

/**
 * 7. HEALTH CHECK
 *
 * GET /
 * Kiểm tra Backend có hoạt động hay không.
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API đang hoạt động",
  });
});

/**
 * 8. CUSTOMER ROUTES
 *
 * Prefix: /api/customer
 */
app.use("/api/customer", customerRoutes);

/**
 * 9. ADMIN ROUTES
 *
 * Prefix: /api/admin
 */
app.use("/api/admin", adminRoutes);

/**
 * 10. CUSTOMER STATISTICS ROUTES
 *
 * Prefix: /api/customer/statistics
 */
app.use(
  "/api/customer/statistics",
  customerStatisticsRoutes,
);

/**
 * 11. ADMIN STATISTICS ROUTES
 *
 * Prefix: /api/admin/statistics
 */
app.use(
  "/api/admin/statistics",
  adminStatisticsRoutes,
);

/**
 * 12. BRAND ROUTES
 *
 * Prefix: /api/brands
 */
app.use("/api/brands", brandRoutes);

/**
 * 13. CATEGORY ROUTES
 *
 * Prefix: /api/categories
 */
app.use("/api/categories", categoryRoutes);

/**
 * 14. ATTRIBUTE ROUTES
 *
 * Prefix: /api/attributes
 */
app.use("/api/attributes", attributeRoutes);

/**
 * 15. PRODUCT ROUTES
 *
 * Prefix: /api/products
 */
app.use("/api/products", productRoutes);

/**
 * 16. PRODUCT VARIANT ROUTES
 *
 * Giữ nguyên prefix /api theo cấu hình cũ.
 */
app.use("/api", productVariantRoutes);

/**
 * 17. PRODUCT MEDIA ROUTES
 *
 * Giữ nguyên prefix /api theo cấu hình cũ.
 */
app.use("/api", productMediaRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Wishlist
app.use("/api/wishlist", wishlistRoutes);

// Coupon
app.use("/api/coupons", couponRoutes);
// =======================================================
// API: AI TÌM KIẾM SẢN PHẨM
// Endpoint: POST /api/ai/products/search
// =======================================================

app.use("/api/ai/products", aiProductSearchRoutes);

/**
 * 18. USER ADDRESS ROUTES
 *
 * Prefix: /api/user-addresses
 * Chỉ đăng ký một lần.
 */
app.use("/api/user-addresses", userAddressRoutes);

app.use("/api/admin/statistics", adminStatisticsRoutes);
// API quản lý khách hàng
app.use("/api/admin/customers", adminCustomerRoutes);

app.use("/api/checkout", checkoutRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/orders", orderItemRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/order-items", adminOrderItemRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

/**
 * 19. API NOT FOUND
 *
 * Đặt sau toàn bộ routes.
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API không tồn tại",
  });
});

/**
 * 20. GLOBAL ERROR HANDLER
 *
 * Đặt cuối cùng để xử lý lỗi được chuyển đến next(error).
 */
app.use(errorMiddleware);

/**
 * 21. EXPORT EXPRESS APP
 */
export default app;
