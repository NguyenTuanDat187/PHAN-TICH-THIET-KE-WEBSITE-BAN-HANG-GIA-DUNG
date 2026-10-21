
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'returned';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'COD'
  | 'BANK'
  | 'MOMO'
  | 'VNPAY'
  | 'ZALOPAY';

export interface Order {
  id: number;
  order_number: string;

  user_id: number | null;
  coupon_id: number | null;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  shipping_address: string;
  shipping_ward: string | null;
  shipping_district: string | null;
  shipping_province: string | null;

  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;

  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;

  note: string | null;

  confirmed_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;

  created_at: string;
  updated_at: string;
}
