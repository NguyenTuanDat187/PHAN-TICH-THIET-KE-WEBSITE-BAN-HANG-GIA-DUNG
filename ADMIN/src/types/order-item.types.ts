
export interface OrderItem {
  id: number;
  order_id: number;

  product_id: number;
  variant_id: number | null;

  product_name: string;
  product_sku: string | null;

  variant_sku: string | null;
  variant_attributes: string | null;

  quantity: number;

  unit_price: number;
  discount_amount: number;
  total_price: number;

  created_at: string | null;
}
