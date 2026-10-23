
/** Khớp với bảng product_reviews trong MySQL. */
export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  order_id: number | null;
  rating: number;
  title: string | null;
  content: string | null;
  images: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

/** Thông tin lấy từ bảng users. */
export interface ReviewCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'blocked';
}

/** Thông tin lấy từ products và product_media. */
export interface ReviewProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  is_active: boolean;
}

/** Thông tin lấy từ bảng orders. */
export interface ReviewOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

/** View model dùng trong admin, không phải bảng database. */
export interface ReviewDetail extends ProductReview {
  customer: ReviewCustomer;
  product: ReviewProduct;
  order: ReviewOrder | null;
  imageUrls: string[];
}

export type ReviewVisibility = 'all' | 'visible' | 'hidden';
export type ReviewRatingFilter = 'all' | 'low' | 'middle' | 'high';
export type ReviewPeriod = 'all' | '7days' | '30days';
