
export type CouponDiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;

  discount_type: CouponDiscountType;
  discount_value: number;

  minimum_order_amount: number;
  maximum_discount_amount: number | null;

  usage_limit: number | null;
  used_count: number;
  per_user_limit: number | null;

  starts_at: string | null;
  expires_at: string | null;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}
