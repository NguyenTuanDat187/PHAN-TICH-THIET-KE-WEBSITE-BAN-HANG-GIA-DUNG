/**
 * =========================================================
 * FILE: BACK_END/src/services/aiProductFilter.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Chuyển bộ lọc AI thành truy vấn MongoDB.
 * - Chỉ lấy sản phẩm đang hoạt động.
 * - Lọc theo từ khóa, danh mục, thương hiệu, giá, đánh giá.
 * - Lọc theo thuộc tính của biến thể sản phẩm.
 * - Lọc sản phẩm còn hàng.
 * - Sắp xếp và phân trang kết quả.
 * - Chỉ trả về thông tin lấy từ MongoDB.
 *
 * LƯU Ý:
 * - AI chỉ tạo bộ lọc tìm kiếm, không được tự tạo dữ liệu sản phẩm.
 * - Giá và tồn kho được kiểm tra từ ProductVariant.
 * - Khi người dùng chọn nhiều thuộc tính, một biến thể phải
 *   thỏa mãn đồng thời tất cả thuộc tính đó.
 * =========================================================
 */

import { Types } from "mongoose";

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

import type {
  AIProductFilters,
} from "../types/aiProductSearch.type";

/**
 * =========================================================
 * 1. KIỂU DỮ LIỆU
 * =========================================================
 */

/**
 * Dữ liệu trả về sau khi tìm kiếm sản phẩm.
 */
export interface ProductSearchResult {
  products: Record<string, unknown>[];
  totalProducts: number;
  page: number;
  limit: number;
}

/**
 * Kiểu ID MongoDB.
 */
type MongoId = Types.ObjectId;

/**
 * =========================================================
 * 2. HÀM HỖ TRỢ
 * =========================================================
 */

/**
 * Escape ký tự đặc biệt để không cho từ khóa
 * trở thành biểu thức Regular Expression ngoài ý muốn.
 */
const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Tạo regex tìm kiếm không phân biệt chữ hoa/chữ thường.
 */
const makeRegex = (value: string): RegExp =>
  new RegExp(escapeRegex(value.trim()), "i");

/**
 * Chuyển giá trị ID về chuỗi để so sánh an toàn.
 */
const idToString = (id: unknown): string => String(id);

/**
 * Loại bỏ các ID trùng nhau.
 */
const uniqueIds = (ids: MongoId[]): MongoId[] => {
  const uniqueMap = new Map<string, MongoId>();

  for (const id of ids) {
    uniqueMap.set(idToString(id), id);
  }

  return Array.from(uniqueMap.values());
};

/**
 * Lấy giao của hai tập ID.
 *
 * Dùng để bảo đảm một biến thể phải thỏa mãn
 * tất cả các thuộc tính được yêu cầu.
 */
const intersectIds = (
  firstIds: MongoId[],
  secondIds: MongoId[],
): MongoId[] => {
  const secondIdSet = new Set(
    secondIds.map(idToString),
  );

  return uniqueIds(
    firstIds.filter((id) =>
      secondIdSet.has(idToString(id)),
    ),
  );
};

/**
 * Kiểm tra giá trị số hợp lệ.
 */
const isValidNumber = (
  value: unknown,
): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Trả kết quả rỗng theo đúng cấu trúc chung.
 */
const emptyResult = (
  page: number,
  limit: number,
): ProductSearchResult => ({
  products: [],
  totalProducts: 0,
  page,
  limit,
});

/**
 * =========================================================
 * 3. HÀM TÌM KIẾM SẢN PHẨM
 * =========================================================
 */

export const filterProductsFromDatabase = async (
  filters: AIProductFilters,
  page: number,
  limit: number,
): Promise<ProductSearchResult> => {
  /**
   * Chuẩn hóa phân trang để tránh skip/limit không hợp lệ.
   */
  const safePage = Math.max(
    1,
    Math.floor(Number(page) || 1),
  );

  const safeLimit = Math.min(
    20,
    Math.max(1, Math.floor(Number(limit) || 5)),
  );

  const skip = (safePage - 1) * safeLimit;

  /**
   * =======================================================
   * BƯỚC 1: CHỈ LẤY SẢN PHẨM ĐANG HOẠT ĐỘNG
   * =======================================================
   */

  const mongoFilter: Record<string, unknown> = {
    isActive: true,
  };

  /**
   * Danh sách ID sản phẩm được giới hạn bởi điều kiện
   * thuộc tính, giá hoặc tồn kho.
   *
   * null nghĩa là chưa có giới hạn ID từ các điều kiện này.
   */
  let allowedProductIds: MongoId[] | null = null;

  /**
   * =======================================================
   * BƯỚC 2: LỌC TỪ KHÓA
   * =======================================================
   */

  const keywords = Array.isArray(filters.keywords)
    ? filters.keywords
        .filter(
          (word): word is string =>
            typeof word === "string" &&
            word.trim().length > 0,
        )
        .map((word) => word.trim())
    : [];

  if (keywords.length > 0) {
    /**
     * Mỗi từ khóa phải xuất hiện trong ít nhất một trường.
     *
     * Ví dụ:
     * ["nồi", "inox"]
     *
     * Sản phẩm phải chứa "nồi" và "inox";
     * mỗi từ có thể nằm ở tên, mô tả hoặc SKU.
     */
    mongoFilter.$and = keywords.map((word) => {
      const regex = makeRegex(word);

      return {
        $or: [
          { name: regex },
          { description: regex },
          { sku: regex },
        ],
      };
    });
  }

  /**
   * =======================================================
   * BƯỚC 3: LỌC DANH MỤC
   * =======================================================
   */

  if (
    typeof filters.categoryName === "string" &&
    filters.categoryName.trim()
  ) {
    const category = await Category.findOne({
      name: makeRegex(filters.categoryName),
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!category) {
      return emptyResult(safePage, safeLimit);
    }

    mongoFilter.categoryId = category._id;
  }

  /**
   * =======================================================
   * BƯỚC 4: LỌC THƯƠNG HIỆU
   * =======================================================
   */

  if (
    typeof filters.brandName === "string" &&
    filters.brandName.trim()
  ) {
    const brand = await Brand.findOne({
      name: makeRegex(filters.brandName),
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!brand) {
      return emptyResult(safePage, safeLimit);
    }

    mongoFilter.brandId = brand._id;
  }

  /**
   * =======================================================
   * BƯỚC 5: LỌC ĐÁNH GIÁ TỐI THIỂU
   * =======================================================
   */

  if (
    filters.minRating !== null &&
    filters.minRating !== undefined &&
    isValidNumber(filters.minRating)
  ) {
    mongoFilter.averageRating = {
      $gte: filters.minRating,
    };
  }

  /**
   * =======================================================
   * BƯỚC 6: LỌC THUỘC TÍNH BIẾN THỂ
   * =======================================================
   *
   * Ví dụ người dùng yêu cầu:
   * - Dung tích = 5 lít.
   * - Màu sắc = trắng.
   *
   * Một biến thể chỉ hợp lệ khi có cả hai thuộc tính.
   */

  const attributeFilters = Array.isArray(filters.attributes)
    ? filters.attributes.filter(
        (item) =>
          typeof item?.name === "string" &&
          item.name.trim().length > 0 &&
          typeof item?.value === "string" &&
          item.value.trim().length > 0,
      )
    : [];

  let matchingVariantIds: MongoId[] | null = null;

  for (const attributeFilter of attributeFilters) {
    const attribute = await Attribute.findOne({
      name: makeRegex(attributeFilter.name),
    })
      .select("_id")
      .lean();

    if (!attribute) {
      return emptyResult(safePage, safeLimit);
    }

    const attributeValue = await AttributeValue.findOne({
      attributeId: attribute._id,
      value: makeRegex(attributeFilter.value),
    })
      .select("_id")
      .lean();

    if (!attributeValue) {
      return emptyResult(safePage, safeLimit);
    }

    const variantAttributeRows = await VariantAttribute.find({
      attributeId: attribute._id,
      attributeValueId: attributeValue._id,
    })
      .select("variantId")
      .lean();

    const currentVariantIds = uniqueIds(
      variantAttributeRows
        .map((row) => row.variantId)
        .filter(
          (id): id is MongoId =>
            id instanceof Types.ObjectId,
        ),
    );

    if (currentVariantIds.length === 0) {
      return emptyResult(safePage, safeLimit);
    }

    /**
     * Thuộc tính đầu tiên tạo tập ID ban đầu.
     * Các thuộc tính tiếp theo lấy giao với tập trước.
     */
    matchingVariantIds =
      matchingVariantIds === null
        ? currentVariantIds
        : intersectIds(
            matchingVariantIds,
            currentVariantIds,
          );

    if (matchingVariantIds.length === 0) {
      return emptyResult(safePage, safeLimit);
    }
  }

  /**
   * =======================================================
   * BƯỚC 7: LỌC GIÁ VÀ TỒN KHO TỪ BIẾN THỂ THỰC TẾ
   * =======================================================
   *
   * Điều kiện giá được áp dụng trên ProductVariant.price.
   * Không phụ thuộc việc Product.minPrice/maxPrice đã
   * được đồng bộ chính xác hay chưa.
   */

  const hasMinPrice =
    filters.minPrice !== null &&
    filters.minPrice !== undefined &&
    isValidNumber(filters.minPrice);

  const hasMaxPrice =
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined &&
    isValidNumber(filters.maxPrice);

  const variantFilter: Record<string, unknown> = {
    isActive: true,
  };

  if (filters.inStock) {
    variantFilter.stockQuantity = {
      $gt: 0,
    };
  }

  if (hasMinPrice || hasMaxPrice) {
    const priceFilter: Record<string, number> = {};

    if (hasMinPrice) {
      priceFilter.$gte = filters.minPrice as number;
    }

    if (hasMaxPrice) {
      priceFilter.$lte = filters.maxPrice as number;
    }

    variantFilter.price = priceFilter;
  }

  /**
   * Nếu có lọc thuộc tính, chỉ tìm trong các biến thể
   * đã thỏa mãn đồng thời tất cả thuộc tính.
   */
  if (matchingVariantIds !== null) {
    variantFilter._id = {
      $in: matchingVariantIds,
    };
  }

  /**
   * Chỉ truy vấn ProductVariant khi có ít nhất một điều kiện
   * cần kiểm tra từ biến thể.
   */
  const needsVariantFilter =
    matchingVariantIds !== null ||
    Boolean(filters.inStock) ||
    hasMinPrice ||
    hasMaxPrice;

  if (needsVariantFilter) {
    const matchedVariants = await ProductVariant.find(
      variantFilter,
    )
      .select("_id productId")
      .lean();

    if (matchedVariants.length === 0) {
      return emptyResult(safePage, safeLimit);
    }

    const matchedProductIds = uniqueIds(
      matchedVariants
        .map((variant) => variant.productId)
        .filter(
          (id): id is MongoId =>
            id instanceof Types.ObjectId,
        ),
    );

    if (matchedProductIds.length === 0) {
      return emptyResult(safePage, safeLimit);
    }

    allowedProductIds = matchedProductIds;
  }

  /**
   * Áp dụng tập ID sản phẩm được lọc từ biến thể.
   */
  if (allowedProductIds !== null) {
    mongoFilter._id = {
      $in: allowedProductIds,
    };
  }

  /**
   * =======================================================
   * BƯỚC 8: SẮP XẾP
   * =======================================================
   *
   * Lưu ý:
   * - newest, rating, sales dùng dữ liệu trên Product.
   * - price_asc/price_desc dùng minPrice/maxPrice đã lưu
   *   trên Product để sắp xếp.
   *
   * Điều kiện lọc giá ở bước trên đã sử dụng giá biến thể
   * thực tế. Nếu muốn sắp xếp giá tuyệt đối theo giá biến thể,
   * cần triển khai aggregation hoặc sắp xếp theo giá tổng hợp.
   */

  let sortOption: Record<string, 1 | -1>;

  switch (filters.sort) {
    case "price_asc":
      sortOption = {
        minPrice: 1,
        basePrice: 1,
        _id: 1,
      };
      break;

    case "price_desc":
      sortOption = {
        maxPrice: -1,
        basePrice: -1,
        _id: 1,
      };
      break;

    case "rating":
      sortOption = {
        averageRating: -1,
        totalReviews: -1,
        _id: 1,
      };
      break;

    case "sales":
      sortOption = {
        totalSales: -1,
        _id: 1,
      };
      break;

    case "newest":
      sortOption = {
        createdAt: -1,
        _id: -1,
      };
      break;

    default:
      sortOption = {
        averageRating: -1,
        totalSales: -1,
        _id: 1,
      };
      break;
  }

  /**
   * =======================================================
   * BƯỚC 9: ĐẾM VÀ LẤY SẢN PHẨM THEO TRANG
   * =======================================================
   */

  const totalProducts =
    await Product.countDocuments(mongoFilter);

  if (totalProducts === 0) {
    return emptyResult(safePage, safeLimit);
  }

  const foundProducts = await Product.find(mongoFilter)
    .sort(sortOption)
    .skip(skip)
    .limit(safeLimit)
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug")
    .lean();

  if (foundProducts.length === 0) {
    return {
      products: [],
      totalProducts,
      page: safePage,
      limit: safeLimit,
    };
  }

  const productIds = foundProducts
    .map((product) => product._id)
    .filter(
      (id): id is MongoId =>
        id instanceof Types.ObjectId,
    );

  /**
   * =======================================================
   * BƯỚC 10: LẤY ẢNH SẢN PHẨM
   * =======================================================
   */

  const mediaRows =
    productIds.length > 0
      ? await ProductMedia.find({
          productId: {
            $in: productIds,
          },
        })
          .sort({
            isPrimary: -1,
            sortOrder: 1,
          })
          .lean()
      : [];

  const mediaByProduct = new Map<
    string,
    Record<string, unknown>[]
  >();

  for (const media of mediaRows) {
    const productId = idToString(media.productId);
    const current = mediaByProduct.get(productId) ?? [];

    current.push(
      media as unknown as Record<string, unknown>,
    );

    mediaByProduct.set(productId, current);
  }

  /**
   * =======================================================
   * BƯỚC 11: LẤY BIẾN THỂ ĐANG HOẠT ĐỘNG
   * =======================================================
   */

  const variants =
    productIds.length > 0
      ? await ProductVariant.find({
          productId: {
            $in: productIds,
          },
          isActive: true,
        }).lean()
      : [];

  const variantsByProduct = new Map<
    string,
    Record<string, unknown>[]
  >();

  for (const variant of variants) {
    const productId = idToString(variant.productId);
    const current = variantsByProduct.get(productId) ?? [];

    current.push(
      variant as unknown as Record<string, unknown>,
    );

    variantsByProduct.set(productId, current);
  }

  /**
   * =======================================================
   * BƯỚC 12: CHUẨN HÓA DỮ LIỆU TRẢ VỀ
   * =======================================================
   */

  const products: Record<string, unknown>[] =
    foundProducts.map((product) => {
      const id = idToString(product._id);

      const productVariants =
        variantsByProduct.get(id) ?? [];

      const productMedia =
        mediaByProduct.get(id) ?? [];

      /**
       * Lấy giá từ các biến thể đang hoạt động.
       */
      const variantPrices = productVariants
        .map((variant) => Number(variant.price))
        .filter(
          (price) =>
            Number.isFinite(price) && price >= 0,
        );

      /**
       * Tổng tồn kho của các biến thể đang hoạt động.
       */
      const totalVariantStock = productVariants.reduce(
        (total, variant) => {
          const stock = Number(variant.stockQuantity);

          return (
            total +
            (Number.isFinite(stock)
              ? Math.max(0, stock)
              : 0)
          );
        },
        0,
      );

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,

        /**
         * Giá gốc từ Product.
         */
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,

        /**
         * Giá thực tế tổng hợp từ các biến thể đang hoạt động.
         */
        availableVariantPriceRange:
          variantPrices.length > 0
            ? {
                min: Math.min(...variantPrices),
                max: Math.max(...variantPrices),
              }
            : null,

        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        totalSales: product.totalSales,

        category: product.categoryId,
        brand: product.brandId,

        variants: productVariants,
        totalVariantStock,

        media: productMedia,
      };
    });

  /**
   * =======================================================
   * BƯỚC 13: TRẢ KẾT QUẢ
   * =======================================================
   */

  return {
    products,
    totalProducts,
    page: safePage,
    limit: safeLimit,
  };
};
