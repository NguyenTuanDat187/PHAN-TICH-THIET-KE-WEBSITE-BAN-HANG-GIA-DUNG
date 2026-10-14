import dotenv from "dotenv";
import mongoose from "mongoose";
import * as models from "../src/models";

dotenv.config();

async function checkDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BAN_HANG_GIA_DUNG";
  console.log("==================================================");
  console.log("🔍 ĐANG KIỂM TRA DATABASE VÀ SCHEMAS / COLLECTIONS");
  console.log("==================================================");
  console.log(`📡 Chuỗi kết nối: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Kết nối MongoDB thành công! (Database: "${mongoose.connection.name}")\n`);

    const db = mongoose.connection.db;
    if (!db) {
      console.log("❌ Không lấy được instance db từ mongoose.");
      return;
    }

    const dbCollections = await db.listCollections().toArray();
    const existingCollNames = new Set(dbCollections.map((c) => c.name));

    console.log(`📋 Tổng số Collections hiện có trên MongoDB: ${dbCollections.length}`);
    dbCollections.forEach((c) => {
      console.log(`   - ${c.name}`);
    });
    console.log("");

    console.log("📊 TRẠNG THÁI TỪNG MODEL TRONG CODE SO VỚI DATABASE:");
    console.log("--------------------------------------------------------------------------------");
    console.log(
      `${"Model Name".padEnd(20)} | ${"Collection Name".padEnd(22)} | ${"Trạng thái".padEnd(16)} | ${"Số documents"}`
    );
    console.log("--------------------------------------------------------------------------------");

    let countExists = 0;
    let countMissing = 0;

    for (const [modelName, modelObj] of Object.entries(models)) {
      const collName = (modelObj as any)?.collection?.name || "(chưa rõ)";
      const isExist = existingCollNames.has(collName);

      let docCount = 0;
      if (isExist) {
        countExists++;
        try {
          docCount = await (modelObj as any).countDocuments();
        } catch {
          docCount = 0;
        }
      } else {
        countMissing++;
      }

      const statusStr = isExist ? "✅ ĐÃ CÓ TRÊN DB" : "❌ CHƯA CÓ TRÊN DB";
      console.log(
        `${modelName.padEnd(20)} | ${collName.padEnd(22)} | ${statusStr.padEnd(16)} | ${docCount} records`
      );
    }

    console.log("--------------------------------------------------------------------------------");
    console.log(`Tổng kết: ${countExists} models đã có collection, ${countMissing} models chưa có collection.`);

    await mongoose.disconnect();
    console.log("\n🔌 Đã ngắt kết nối database.");
  } catch (error: any) {
    console.error("\n❌ Lỗi khi kết nối hoặc kiểm tra MongoDB:", error.message);
    console.log("\nGợi ý:");
    console.log("1. Kiểm tra service MongoDB (mongod) đã được bật trên máy chưa.");
    console.log("2. Kiểm tra MONGO_URI trong file .env.");
  }
}

checkDatabase();
