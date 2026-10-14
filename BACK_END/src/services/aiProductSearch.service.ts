
/**
 * =========================================================
 * FILE: BACK_END/src/services/aiProductSearch.service.ts
 * =========================================================
 *
 * NHIỆM VỤ:
 * - Dùng OpenAI hiểu yêu cầu tìm kiếm.
 * - Ép AI trả về JSON theo cấu trúc đã quy định.
 * - Kiểm tra dữ liệu AI trước khi đưa vào MongoDB.
 * - Trả kết quả tìm kiếm và phân trang.
 */

import {
  openai,
  OPENAI_MODEL,
} from "../config/openai";

import {
  AIProductFilters,
  AIProductSearchInput,
} from "../types/aiProductSearch.type";

import {
  filterProductsFromDatabase,
} from "./aiProductFilter.service";

const ALLOWED_SORTS = [
  "relevance",
  "price_asc",
  "price_desc",
  "rating",
  "newest",
  "sales",
] as const;

const SYSTEM_PROMPT = `
Bạn là bộ phân tích yêu cầu tìm kiếm sản phẩm cho website bán đồ gia dụng.

Nhiệm vụ duy nhất:
Chuyển câu tìm kiếm tiếng Việt của khách hàng thành JSON theo cấu trúc được yêu cầu.

Quy tắc:
1. Không tự tạo sản phẩm, giá, thương hiệu hoặc thông số.
2. keywords chỉ chứa từ khóa loại sản phẩm và đặc điểm nhận dạng chính.
3. categoryName là tên danh mục nếu khách hàng nói rõ.
4. brandName là thương hiệu nếu khách hàng nói rõ.
5. minPrice/maxPrice là số tiền theo đơn vị tiền tệ đang dùng trong database.
6. Nếu khách nói "dưới 2 triệu", maxPrice = 2000000.
7. Nếu khách nói "từ 1 đến 2 triệu", minPrice = 1000000, maxPrice = 2000000.
8. Nếu khách yêu cầu còn hàng, inStock = true. Nếu không nói, inStock = false.
9. attributes dùng cho các thông số như dung tích, công suất, màu sắc, kích thước.
10. Chỉ đưa vào attributes những thuộc tính khách hàng thực sự yêu cầu.
11. Không tự suy diễn thuộc tính không được nói rõ.
12. minRating chỉ dùng khi khách yêu cầu điểm đánh giá tối thiểu.
13. sort phải là một trong:
    relevance, price_asc, price_desc, rating, newest, sales.
14. Nếu không nêu điều kiện nào, trường tương ứng phải là null,
    mảng rỗng hoặc giá trị mặc định theo schema.
15. reply là một câu ngắn bằng tiếng Việt.
16. Chỉ trả về JSON, không có Markdown hay giải thích bên ngoài JSON.
`;

const clampNumber = (
  value: unknown,
  minimum: number,
  maximum: number,
): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < minimum || value > maximum) {
    return null;
  }

  return value;
};

const normalizeFilters = (
  raw: any,
): AIProductFilters => {
  const rawKeywords = Array.isArray(raw?.keywords)
    ? raw.keywords
    : [];

  const keywords = rawKeywords
    .filter((item: unknown): item is string =>
      typeof item === "string",
    )
    .map((item: string) => item.trim())
    .filter((item: string) => item.length > 0)
    .slice(0, 8);

  const rawAttributes = Array.isArray(raw?.attributes)
    ? raw.attributes
    : [];

  const attributes = rawAttributes
    .filter(
      (item: any) =>
        item &&
        typeof item.name === "string" &&
        typeof item.value === "string",
    )
    .map((item: any) => ({
      name: item.name.trim().slice(0, 80),
      value: item.value.trim().slice(0, 100),
    }))
    .filter(
      (item: { name: string; value: string }) =>
        item.name.length > 0 && item.value.length > 0,
    )
    .slice(0, 8);

  const requestedSort = raw?.sort;
  const sort = ALLOWED_SORTS.includes(requestedSort)
    ? requestedSort
    : "relevance";

  let minPrice = clampNumber(raw?.minPrice, 0, 1_000_000_000_000);
  let maxPrice = clampNumber(raw?.maxPrice, 0, 1_000_000_000_000);

  // Không thực hiện truy vấn với khoảng giá mâu thuẫn.
  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice
  ) {
    minPrice = null;
    maxPrice = null;
  }

  return {
    keywords,
    categoryName:
      typeof raw?.categoryName === "string" &&
      raw.categoryName.trim()
        ? raw.categoryName.trim().slice(0, 100)
        : null,

    brandName:
      typeof raw?.brandName === "string" &&
      raw.brandName.trim()
        ? raw.brandName.trim().slice(0, 100)
        : null,

    minPrice,
    maxPrice,
    minRating: clampNumber(raw?.minRating, 0, 5),
    inStock: raw?.inStock === true,
    attributes,
    sort,
    reply:
      typeof raw?.reply === "string" && raw.reply.trim()
        ? raw.reply.trim().slice(0, 300)
        : "Đây là những sản phẩm phù hợp với yêu cầu của bạn.",
  };
};

const parseSearchQuery = async (
  query: string,
): Promise<AIProductFilters> => {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          query,
          requiredOutputSchema: {
            keywords: ["string"],
            categoryName: "string | null",
            brandName: "string | null",
            minPrice: "number | null",
            maxPrice: "number | null",
            minRating: "number | null",
            inStock: "boolean",
            attributes: [
              {
                name: "string",
                value: "string",
              },
            ],
            sort: ALLOWED_SORTS,
            reply: "string",
          },
        }),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "OpenAI không trả về dữ liệu phân tích tìm kiếm.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      "Không thể đọc dữ liệu phân tích từ OpenAI.",
    );
  }

  return normalizeFilters(parsed);
};

export const aiProductSearchService = async (
  input: AIProductSearchInput,
) => {
  const filters = await parseSearchQuery(input.query);

  const result = await filterProductsFromDatabase(
    filters,
    input.page,
    input.limit,
  );

  const totalPages = Math.ceil(
    result.totalProducts / input.limit,
  );

  return {
    reply:
      result.totalProducts > 0
        ? filters.reply
        : "Chưa tìm thấy sản phẩm phù hợp với các điều kiện đã nêu.",

    appliedFilters: filters,

    products: result.products,

    pagination: {
      page: input.page,
      limit: input.limit,
      totalProducts: result.totalProducts,
      totalPages,
      hasMore: input.page < totalPages,
    },
  };
};
