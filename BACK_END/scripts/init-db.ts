import dotenv from "dotenv";
import mongoose from "mongoose";
import * as models from "../src/models";

dotenv.config();

async function initCollections() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BAN_HANG_GIA_DUNG";
  console.log("==================================================");
  console.log("🚀 BẮT ĐẦU KHỞI TẠO TẤT CẢ COLLECTIONS & INDEXES");
  console.log("==================================================");
  console.log(`📡 Kết nối tới: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Kết nối MongoDB thành công! (Database: "${mongoose.connection.name}")\n`);

    console.log("📦 Đang khởi tạo các collections...");
    for (const [name, model] of Object.entries(models)) {
      try {
        await (model as any).createCollection();
        console.log(`  ✅ [${name}] → Collection "${(model as any).collection.name}" đã được tạo`);
      } catch (err: any) {
        if (err?.codeName === "NamespaceExists") {
          console.log(`  ℹ️ [${name}] → Collection "${(model as any).collection.name}" đã tồn tại`);
        } else {
          console.error(`  ❌ [${name}] → Lỗi: ${err.message}`);
        }
      }
    }

    console.log("\n⚡ Đang đồng bộ indexes...");
    for (const [name, model] of Object.entries(models)) {
      try {
        await (model as any).syncIndexes();
      } catch (err: any) {
        console.warn(`  ⚠️ [${name}] → Không thể đồng bộ index: ${err.message}`);
      }
    }

    console.log("\n==================================================");
    console.log("🎉 TẤT CẢ COLLECTIONS ĐÃ ĐƯỢC TẠO LÊN DATABASE!");
    console.log("==================================================");

    await mongoose.disconnect();
    console.log("🔌 Đã đóng kết nối.");
  } catch (err: any) {
    console.error("❌ Lỗi khởi tạo database:", err.message);
  }
}

initCollections();
