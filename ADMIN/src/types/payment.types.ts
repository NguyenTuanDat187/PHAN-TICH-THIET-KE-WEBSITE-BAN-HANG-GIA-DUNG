
export type PaymentMethod =
  | 'COD'
  | 'BANK'
  | 'MOMO'
  | 'VNPAY'
  | 'ZALOPAY';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Payment {
  id: number;
  order_id: number;

  payment_method: PaymentMethod;
  transaction_code: string | null;

  amount: number;
  status: PaymentStatus;

  gateway_response: string | null;
  paid_at: string | null;

  created_at: string;
  updated_at: string;
}
