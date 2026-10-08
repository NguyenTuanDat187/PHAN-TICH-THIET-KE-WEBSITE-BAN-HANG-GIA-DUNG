/**
 * =========================================================
 * FILE: BACK_END/scripts/create-admin.ts
 * =========================================================
 *
 * MỤC ĐÍCH:
 * - Tạo tài khoản Admin ban đầu cho hệ thống.
 * - Admin được lưu trong MongoDB thông qua User Model.
 * - Không tạo Admin Model riêng.
 *
 * NGUYÊN TẮC:
 *
 * 1. Email Admin lấy từ biến môi trường .env
 * 2. Password Admin lấy từ biến môi trường .env
 * 3. Password phải được hash bằng bcrypt trước khi lưu.
 * 4. role luôn là "admin".
 * 5. status mặc định là "active".
 * 6. Không cho phép tạo Admin thứ hai.
 * 7. Nếu email đã tồn tại thì không tạo tài khoản mới.
 *
 * =========================================================
 */

import dotenv from "dotenv";
import bcrypt from "bcrypt";

import connectDatabase from "../src/config/database";
import User from "../src/models/User.model";

/**
 * =========================================================
 * LOAD ENVIRONMENT VARIABLES
 * =========================================================
 *
 * Đọc file .env ở thư mục BACK_END.
 *
 * =========================================================
 */

dotenv.config();

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

/**
 * Số vòng hash bcrypt.
 *
 * Phải đồng bộ với auth.service.ts.
 */

const BCRYPT_SALT_ROUNDS = 12;

/**
 * =========================================================
 * MAIN FUNCTION
 * =========================================================
 */

const createAdmin = async (): Promise<void> => {
    try {
        console.log("");
        console.log("=========================================================");
        console.log("          TẠO TÀI KHOẢN ADMIN BAN ĐẦU");
        console.log("=========================================================");
        console.log("");

        /**
         * =======================================================
         * 1. KIỂM TRA BIẾN MÔI TRƯỜNG
         * =======================================================
         */

        const adminName = process.env.ADMIN_NAME?.trim();
        const adminEmail = process.env.ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

        const adminPassword = process.env.ADMIN_PASSWORD;

        /**
         * Kiểm tra tên Admin.
         */

        if (!adminName) {
            throw new Error(
                "Thiếu ADMIN_NAME trong file .env",
            );
        }

        /**
         * Kiểm tra email Admin.
         */

        if (!adminEmail) {
            throw new Error(
                "Thiếu ADMIN_EMAIL trong file .env",
            );
        }

        /**
         * Kiểm tra password Admin.
         */

        if (!adminPassword) {
            throw new Error(
                "Thiếu ADMIN_PASSWORD trong file .env",
            );
        }

        /**
         * =======================================================
         * 2. VALIDATE EMAIL
         * =======================================================
         */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(adminEmail)) {
            throw new Error(
                "ADMIN_EMAIL không đúng định dạng email.",
            );
        }

        /**
         * =======================================================
         * 3. VALIDATE PASSWORD
         * =======================================================
         *
         * User model hiện tại yêu cầu password tối thiểu 6 ký tự.
         *
         * Tuy nhiên Admin nên sử dụng password mạnh hơn.
         */

        if (adminPassword.length < 8) {
            throw new Error(
                "ADMIN_PASSWORD phải có ít nhất 8 ký tự.",
            );
        }

        /**
         * =======================================================
         * 4. KẾT NỐI DATABASE
         * =======================================================
         */

        console.log("🔌 Đang kết nối MongoDB...");

        await connectDatabase();

        console.log("✅ Kết nối MongoDB thành công.");
        console.log("");

        /**
         * =======================================================
         * 5. KIỂM TRA ADMIN ĐÃ TỒN TẠI CHƯA
         * =======================================================
         *
         * Hệ thống chỉ sử dụng một tài khoản Admin.
         *
         * Vì vậy:
         *
         * - Nếu đã có Admin → dừng chương trình.
         * - Không tạo Admin thứ hai.
         *
         * =======================================================
         */

        const existingAdmin = await User.findOne({
            role: "admin",
        });

        if (existingAdmin) {
            console.log(
                "⚠️ Hệ thống đã tồn tại tài khoản Admin.",
            );

            console.log(
                `📧 Email Admin hiện tại: ${existingAdmin.email}`,
            );

            console.log("");
            console.log(
                "❌ Không tạo thêm Admin mới.",
            );

            console.log("");

            return;
        }

        /**
         * =======================================================
         * 6. KIỂM TRA EMAIL ĐÃ ĐƯỢC SỬ DỤNG CHƯA
         * =======================================================
         *
         * Vì email User đang unique nên không được tạo
         * Admin bằng email đã tồn tại.
         *
         * =======================================================
         */

        const existingUser = await User.findOne({
            email: adminEmail,
        });

        if (existingUser) {
            throw new Error(
                `Email ${adminEmail} đã tồn tại trong hệ thống nhưng không phải Admin.`,
            );
        }

        /**
         * =======================================================
         * 7. HASH PASSWORD
         * =======================================================
         *
         * Tuyệt đối không lưu password dạng plain text.
         *
         * Ví dụ:
         *
         * ADMIN_PASSWORD:
         * Admin@123456
         *
         * Sau bcrypt sẽ thành dạng:
         *
         * $2b$12$....................
         *
         * =======================================================
         */

        console.log("🔐 Đang mã hóa password...");

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            BCRYPT_SALT_ROUNDS,
        );

        console.log("✅ Mã hóa password thành công.");
        console.log("");

        /**
         * =======================================================
         * 8. TẠO ADMIN
         * =======================================================
         */

        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,

            /**
             * Admin được xác định bằng role.
             */

            role: "admin",

            /**
             * Admin mới được phép đăng nhập ngay.
             */

            status: "active",

            /**
             * Email được xác nhận khi Admin được tạo
             * bằng script hệ thống.
             */

            emailVerifiedAt: new Date(),

            /**
             * Các trường này User Model cho phép null.
             */

            phone: null,
            avatar: null,
        });

        /**
         * =======================================================
         * 9. THÔNG BÁO THÀNH CÔNG
         * =======================================================
         */

        console.log("=========================================================");
        console.log("              TẠO ADMIN THÀNH CÔNG");
        console.log("=========================================================");
        console.log("");

        console.log(`👤 Tên      : ${admin.name}`);
        console.log(`📧 Email    : ${admin.email}`);
        console.log(`🔑 Role     : ${admin.role}`);
        console.log(`🟢 Status   : ${admin.status}`);
        console.log(
            `📅 Tạo lúc  : ${admin.createdAt.toLocaleString("vi-VN")}`,
        );

        console.log("");

        console.log(
            "⚠️ Password không được hiển thị để đảm bảo an toàn.",
        );

        console.log("");

        console.log(
            "👉 Bây giờ có thể đăng nhập bằng API:",
        );

        console.log(
            "POST /api/auth/admin/login",
        );

        console.log("");
    } catch (error) {
        /**
         * =======================================================
         * XỬ LÝ LỖI
         * =======================================================
         */

        console.error("");
        console.error("❌ TẠO ADMIN THẤT BẠI");

        if (error instanceof Error) {
            console.error(`📛 ${error.message}`);
        } else {
            console.error(error);
        }

        console.error("");
    } finally {
        /**
         * =======================================================
         * ĐÓNG KẾT NỐI MONGODB
         * =======================================================
         *
         * Script chỉ chạy một lần rồi kết thúc,
         * nên cần đóng kết nối MongoDB.
         *
         * =======================================================
         */

        try {
            await User.db.close();

            console.log(
                "🔌 Đã đóng kết nối MongoDB.",
            );
        } catch (error) {
            console.error(
                "⚠️ Không thể đóng kết nối MongoDB.",
                error,
            );
        }
    }
};

/**
 * =========================================================
 * RUN
 * =========================================================
 */

createAdmin();