
/**
 * =========================================================
 * FILE: BACK_END/src/services/aiChatProduct.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Tìm sản phẩm đang hoạt động trong MongoDB.
 * - Lấy tồn kho từ ProductVariant.
 * - Chuẩn bị dữ liệu sản phẩm để cung cấp cho Gemini.
 */

import { Product, ProductVariant } from "../models";

const MAX_PRODUCTS = 8;

export interface AIChatProductContext {
  _id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  basePrice: number;
  salePrice: number | null;
  averageRating: number;
  totalReviews: number;
  stockQuantity: number;
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Tìm sản phẩm theo nội dung khách hỏi.
 *
 * Đây là tìm kiếm từ khóa cơ bản; chưa thay thế API
 * tìm kiếm sản phẩm bằng AI hiện có.
 */
export const findProductsForAIChat = async (
  message: string,
): Promise<AIChatProductContext[]> => {
  const words = message
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .slice(0, 8);

  // Bỏ từ khóa quá chung để giảm kết quả không liên quan.
  const stopWords = new Set([
    "tôi", "mình", "cho", "một", "nào",
    "với", "loại", "này", "được", "không",
    "giúp", "hãy", "tư", "vấn", "sản",
    "phẩm", "giá", "dưới", "trên", "của",
  ]);

  const keywords = words.filter(
    (word) => !stopWords.has(word.toLowerCase()),
  );

  const conditions = keywords.map((word) => {
    const regex = new RegExp(escapeRegex(word), "i");

    return {
      $or: [
        { name: regex },
        { description: regex },
        { sku: regex },
      ],
    };
  });

  const products = await Product.find({
    isActive: true,
    ...(conditions.length > 0 ? { $and: conditions } : {}),
  })
    .select(
      "_id name slug description basePrice salePrice averageRating totalReviews",
    )
    .limit(MAX_PRODUCTS)
    .lean();

  if (products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product._id);

  // Chỉ tính tồn kho từ các biến thể đang hoạt động.
  const variants = await ProductVariant.find({
    productId: { $in: productIds },
    isActive: true,
  })
    .select("productId stockQuantity")
    .lean();

  const stockByProduct = new Map<string, number>();

  for (const variant of variants) {
    const productId = String(variant.productId);
    const quantity = Math.max(
      0,
      Number(variant.stockQuantity) || 0,
    );

    stockByProduct.set(
      productId,
      (stockByProduct.get(productId) ?? 0) + quantity,
    );
  }

  return products.map((product) => ({
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice) || 0,
    salePrice:
      product.salePrice == null
        ? null
        : Number(product.salePrice),
    averageRating: Number(product.averageRating) || 0,
    totalReviews: Number(product.totalReviews) || 0,
    stockQuantity:
      stockByProduct.get(String(product._id)) ?? 0,
  }));
};
