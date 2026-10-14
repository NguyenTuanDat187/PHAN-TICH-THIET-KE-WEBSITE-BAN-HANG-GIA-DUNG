import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.warn("⚠️ MONGO_URI chưa được cấu hình trong .env. Chạy app ở chế độ không có database.");
            return;
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("=================================");
        console.log("✅ MongoDB connected successfully");
        console.log(`📦 Database: ${mongoose.connection.name}`);
        console.log("=================================");
    } catch (error) {
        console.warn("⚠️ MongoDB connection failed. Server vẫn chạy ở chế độ dev. Vui lòng bật MongoDB service/Docker hoặc cấu hình MONGO_URI trong .env khi cần truy vấn dữ liệu.");
    }
};

export default connectDatabase; 