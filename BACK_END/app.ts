<<<<<<< HEAD
import cors from "cors";
=======
/**
 * =========================================================
 * FILE: BACK_END/src/app.ts
 * =========================================================
 * Mục đích:
 * - Khởi tạo Express App
 * - Cấu hình Middleware
 * - Cấu hình CORS
 * - Cấu hình JSON
 * - Đăng ký các API Routes
 * - Health Check API
 * =========================================================
 */

>>>>>>> 05d35ecfdb67623860d5c624f3540c18babc63b8
import express from "express";
import cors from "cors";

// Import routes
import authRoutes from "./src/routes/auth.routes";

const app = express();

<<<<<<< HEAD
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "API E-Commerce Backend is running",
        timestamp: new Date().toISOString()
    });
});

=======
/**
 * =========================================================
 * GLOBAL MIDDLEWARE
 * =========================================================
 */

// Cho phép Frontend gọi Backend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Cho phép nhận JSON
app.use(express.json());

// Cho phép nhận dữ liệu dạng form
app.use(express.urlencoded({ extended: true }));

/**
 * =========================================================
 * API ROUTES
 * =========================================================
 */

// Authentication
app.use("/api/auth", authRoutes);
/**
 * =========================================================
 * HEALTH CHECK
 * =========================================================
 */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API đang hoạt động",
  });
});

/**
 * =========================================================
 * 404 - ROUTE NOT FOUND
 * =========================================================
 */

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API không tồn tại",
  });
});

/**
 * =========================================================
 * EXPORT APP
 * =========================================================
 */

>>>>>>> 05d35ecfdb67623860d5c624f3540c18babc63b8
export default app;