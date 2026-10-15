
/**
 * =========================================================
 * FILE: BACK_END/src/types/aiProductSearch.type.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Định nghĩa bộ lọc tìm kiếm do AI phân tích.
 * - Định nghĩa dữ liệu phân trang.
 * - Giới hạn những điều kiện được phép dùng để truy vấn.
 */

export type AIProductSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest"
  | "sales";

export interface AIProductFilters {
  // Từ khóa sản phẩm, ví dụ: ["nồi chiên", "không dầu"].
  keywords: string[];

  // Tên danh mục và thương hiệu do người dùng yêu cầu.
  categoryName: string | null;
  brandName: string | null;

  // Khoảng giá tính bằng đơn vị tiền tệ của database.
  minPrice: number | null;
  maxPrice: number | null;

  // Điểm đánh giá tối thiểu, nếu người dùng yêu cầu.
  minRating: number | null;

  // Chỉ lọc sản phẩm có hàng khi người dùng yêu cầu.
  inStock: boolean;

  // Những thuộc tính như dung tích, công suất, màu sắc.
  // Giá trị chỉ là dữ liệu tìm kiếm, không phải dữ liệu sản phẩm.
  attributes: Array<{
    name: string;
    value: string;
  }>;

  sort: AIProductSort;

  // Câu phản hồi ngắn bằng tiếng Việt.
  reply: string;
}

export interface AIProductSearchInput {
  query: string;
  page: number;
  limit: number;
}

export interface AIProductPagination {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasMore: boolean;
}
