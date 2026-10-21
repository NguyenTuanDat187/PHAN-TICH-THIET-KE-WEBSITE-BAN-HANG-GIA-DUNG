
export type MediaType = 'image' | 'video';

export interface ProductMedia {
  id: number;
  product_id: number;
  media_type: MediaType;
  media_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface MediaProductOption {
  id: number;
  name: string;
  sku: string;
}

export interface ProductMediaFormData {
  product_id: number;
  media_type: MediaType;
  media_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}
