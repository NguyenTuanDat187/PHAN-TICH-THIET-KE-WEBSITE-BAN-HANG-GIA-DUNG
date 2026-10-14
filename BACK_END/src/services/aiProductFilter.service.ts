
/**
 * =========================================================
 * FILE: BACK_END/src/services/aiProductFilter.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Chuyển bộ lọc AI thành truy vấn MongoDB.
 * - Không để AI tự cung cấp dữ liệu sản phẩm.
 * - Chỉ lấy sản phẩm đang hoạt động.
 */

import {
  Product,
  ProductVariant,
  ProductMedia,
  Category,
  Brand,
  Attribute,
  AttributeValue,
  VariantAttribute,
} from "../models";

import {
  AIProductFilters,
} from "../types/aiProductSearch.type";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeRegex = (value: string): RegExp =>
  new RegExp(escapeRegex(value.trim()), "i");

export interface ProductSearchResult {
  products: unknown[];
  totalProducts: number;
  page: number;
  limit: number;
}

export const filterProductsFromDatabase = async (
  filters: AIProductFilters,
  page: number,
  limit: number,
): Promise<ProductSearchResult> => {
  const skip = (page - 1) * limit;

  // -------------------------------------------------------
  // BƯỚC 1: CHỈ LẤY SẢN PHẨM ĐANG HOẠT ĐỘNG
  // -------------------------------------------------------

  const mongoFilter: Record<string, any> = {
    isActive: true,
  };

  // -------------------------------------------------------
  // BƯỚC 2: LỌC TỪ KHÓA
  // -------------------------------------------------------

  if (filters.keywords.length > 0) {
    const keywordConditions = filters.keywords
      .filter((word) => word.trim().length > 0)
      .map((word) => {
        const regex = makeRegex(word);

        return {
          $or: [
            { name: regex },
            { description: regex },
            { sku: regex },
          ],
        };
      });

    if (keywordConditions.length > 0) {
      // Mỗi từ khóa phải xuất hiện trong ít nhất một trường.
      mongoFilter.$and = keywordConditions;
    }
  }

  // -------------------------------------------------------
  // BƯỚC 3: LỌC DANH MỤC
  // -------------------------------------------------------

  if (filters.categoryName) {
    const category = await Category.findOne({
      name: makeRegex(filters.categoryName),
      isActive: true,
    }).select("_id");

    if (!category) {
      return {
        products: [],
        totalProducts: 0,
        page,
        limit,
      };
    }

    mongoFilter.categoryId = category._id;
  }

  // -------------------------------------------------------
  // BƯỚC 4: LỌC THƯƠNG HIỆU
  // -------------------------------------------------------

  if (filters.brandName) {
    const brand = await Brand.findOne({
      name: makeRegex(filters.brandName),
      isActive: true,
    }).select("_id");

    if (!brand) {
      return {
        products: [],
        totalProducts: 0,
        page,
        limit,
      };
    }

    mongoFilter.brandId = brand._id;
  }

  // -------------------------------------------------------
  // BƯỚC 5: LỌC KHOẢNG GIÁ
  // minPrice/maxPrice là khoảng giá sản phẩm được lưu sẵn.
  // -------------------------------------------------------

  if (filters.minPrice !== null) {
    mongoFilter.maxPrice = {
      ...(mongoFilter.maxPrice || {}),
      $gte: filters.minPrice,
    };
  }

  if (filters.maxPrice !== null) {
    mongoFilter.minPrice = {
      ...(mongoFilter.minPrice || {}),
      $lte: filters.maxPrice,
    };
  }

  // Nếu model đang lưu minPrice/maxPrice bằng 0 hoặc chưa
  // đồng bộ với giá biến thể, cần sửa truy vấn giá theo
  // ProductVariant trước khi dùng production.
  if (filters.minRating !== null) {
    mongoFilter.averageRating = {
      $gte: filters.minRating,
    };
  }

  // -------------------------------------------------------
  // BƯỚC 6: LỌC THUỘC TÍNH BIẾN THỂ
  // Ví dụ: dung tích = 5 lít, công suất = 1500 W.
  // -------------------------------------------------------

  if (filters.attributes.length > 0) {
    const matchingVariantIds: unknown[] = [];

    for (const attributeFilter of filters.attributes) {
      const attribute = await Attribute.findOne({
        name: makeRegex(attributeFilter.name),
      }).select("_id");

      if (!attribute) {
        // Không tự bỏ qua một điều kiện người dùng yêu cầu.
        return {
          products: [],
          totalProducts: 0,
          page,
          limit,
        };
      }

      const attributeValue = await AttributeValue.findOne({
        attributeId: attribute._id,
        value: makeRegex(attributeFilter.value),
      }).select("_id");

      if (!attributeValue) {
        return {
          products: [],
          totalProducts: 0,
          page,
          limit,
        };
      }

      const variantAttributeRows =
        await VariantAttribute.find({
          attributeId: attribute._id,
          attributeValueId: attributeValue._id,
        }).select("variantId");

      if (variantAttributeRows.length === 0) {
        return {
          products: [],
          totalProducts: 0,
          page,
          limit,
        };
      }

      matchingVariantIds.push(
        ...variantAttributeRows.map((row: any) => row.variantId),
      );
    }

    const activeVariants = await ProductVariant.find({
      _id: { $in: matchingVariantIds },
      isActive: true,
      ...(filters.inStock ? { stockQuantity: { $gt: 0 } } : {}),
    }).select("productId");

    const productIds = activeVariants.map(
      (variant: any) => variant.productId,
    );

    if (productIds.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        page,
        limit,
      };
    }

    mongoFilter._id = { $in: productIds };
  }

  // -------------------------------------------------------
  // BƯỚC 7: NẾU NGƯỜI DÙNG YÊU CẦU CÒN HÀNG
  // -------------------------------------------------------

  if (filters.inStock) {
    const activeVariants = await ProductVariant.find({
      isActive: true,
      stockQuantity: { $gt: 0 },
    }).select("productId");

    const inStockProductIds = activeVariants.map(
      (variant: any) => variant.productId,
    );

    const existingIds = mongoFilter._id?.$in as
      | unknown[]
      | undefined;

    const finalIds = existingIds
      ? existingIds.filter((id) =>
          inStockProductIds.some(
            (stockId: any) => String(stockId) === String(id),
          ),
        )
      : inStockProductIds;

    mongoFilter._id = { $in: finalIds };
  }

  // -------------------------------------------------------
  // BƯỚC 8: SẮP XẾP
  // -------------------------------------------------------

  let sortOption: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  switch (filters.sort) {
    case "price_asc":
      sortOption = { minPrice: 1, basePrice: 1 };
      break;

    case "price_desc":
      sortOption = { maxPrice: -1, basePrice: -1 };
      break;

    case "rating":
      sortOption = { averageRating: -1, totalReviews: -1 };
      break;

    case "sales":
      sortOption = { totalSales: -1 };
      break;

    case "newest":
      sortOption = { createdAt: -1 };
      break;

    default:
      sortOption = { averageRating: -1, totalSales: -1 };
      break;
  }

  // -------------------------------------------------------
  // BƯỚC 9: ĐẾM VÀ LẤY SẢN PHẨM THEO TRANG
  // -------------------------------------------------------

  const totalProducts = await Product.countDocuments(mongoFilter);

  const foundProducts = await Product.find(mongoFilter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug")
    .lean();

  const productIds = foundProducts.map(
    (product: any) => product._id,
  );

  // Lấy ảnh đại diện từ model ProductMedia hiện có.
  const mediaRows = await ProductMedia.find({
    productId: { $in: productIds },
  })
    .sort({ isPrimary: -1, sortOrder: 1 })
    .lean();

  const mediaByProduct = new Map<string, any[]>();

  for (const media of mediaRows as any[]) {
    const productId = String(media.productId);
    const current = mediaByProduct.get(productId) || [];
    current.push(media);
    mediaByProduct.set(productId, current);
  }

  // Chỉ lấy biến thể đang hoạt động của những sản phẩm trên trang.
  const variants = await ProductVariant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  const variantsByProduct = new Map<string, any[]>();

  for (const variant of variants as any[]) {
    const productId = String(variant.productId);
    const current = variantsByProduct.get(productId) || [];
    current.push(variant);
    variantsByProduct.set(productId, current);
  }

  const products = foundProducts.map((product: any) => {
    const id = String(product._id);
    const productVariants = variantsByProduct.get(id) || [];
    const productMedia = mediaByProduct.get(id) || [];

    const variantPrices = productVariants
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price) && price >= 0);

    const variantStock = productVariants.reduce(
      (total, variant) =>
        total + Math.max(0, Number(variant.stockQuantity) || 0),
      0,
    );

    return {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,

      // Trả giá từ database, không để AI tự bịa giá.
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,

      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      totalSales: product.totalSales,

      category: product.categoryId,
      brand: product.brandId,

      // Dữ liệu biến thể và tồn kho thực tế.
      variants: productVariants,
      availableVariantPriceRange: variantPrices.length
        ? {
            min: Math.min(...variantPrices),
            max: Math.max(...variantPrices),
          }
        : null,
      totalVariantStock: variantStock,

      // Chỉ dùng media đã lưu trong database.
      media: productMedia,
    };
  });

  return {
    products,
    totalProducts,
    page,
    limit,
  };
};
