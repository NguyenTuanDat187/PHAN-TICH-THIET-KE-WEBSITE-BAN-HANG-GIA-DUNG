
export interface ProductVariant {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  weight: number | null;
  image: string | null;
  is_active: boolean;
}

export type ProductVariantFormValues = Pick<
  ProductVariant,
  | 'product_id'
  | 'sku'
  | 'price'
  | 'compare_at_price'
  | 'stock_quantity'
  | 'weight'
  | 'is_active'
>;
