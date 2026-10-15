
/**
 * FILE: BACK_END/src/types/aiChat.type.ts
 *
 * NHIỆM VỤ:
 * - Khai báo kiểu dữ liệu dùng chung cho AI Chat.
 */

export interface AIChatInput {
  message: string;
  conversationId?: string;
  sessionId?: string;
}

export interface AIChatProduct {
  _id: string;
  name: string;
  slug?: string;
  basePrice: number;
  salePrice?: number | null;
  description?: string;
  averageRating?: number;
  totalReviews?: number;
  isActive: boolean;
  stockQuantity: number;
}

export interface AIChatProductSearchResult {
  products: AIChatProduct[];
}
