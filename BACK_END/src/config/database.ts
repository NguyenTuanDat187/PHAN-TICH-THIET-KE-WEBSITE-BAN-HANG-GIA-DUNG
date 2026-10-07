import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.warn("⚠️ MONGO_URI chưa được cấu hình trong .env. Chạy app ở chế độ không có database.");
            return;
        }

        await mongoose.connect(mongoUri);

        console.log("=================================");
        console.log("✅ MongoDB connected successfully");
        console.log(`📦 Database: ${mongoose.connection.name}`);
        console.log("=================================");
    } catch (error) {
        console.warn("⚠️ MongoDB connection failed. App vẫn chạy ở chế độ dev, nhưng cần database để dùng API liên quan đến dữ liệu.", error);
    }
};

export default connectDatabase; 