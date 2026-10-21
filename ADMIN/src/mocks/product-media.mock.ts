
import type {
  MediaProductOption,
  ProductMedia,
} from '../types/product-media.types';

export const productMediaProductsMock: MediaProductOption[] = [
  {
    id: 1,
    name: 'Nồi chiên không dầu 6L',
    sku: 'SP001',
  },
  {
    id: 2,
    name: 'Nồi cơm điện tử 1.8L',
    sku: 'SP002',
  },
  {
    id: 3,
    name: 'Máy xay sinh tố đa năng',
    sku: 'SP003',
  },
  {
    id: 4,
    name: 'Ấm siêu tốc inox',
    sku: 'SP004',
  },
  {
    id: 5,
    name: 'Quạt điện đứng',
    sku: 'SP005',
  },
  {
    id: 6,
    name: 'Máy lọc không khí',
    sku: 'SP006',
  },
];

export const productMediaMock: ProductMedia[] = [
  {
    id: 1,
    product_id: 1,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Nồi chiên không dầu màu đen',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-10T09:00:00',
  },
  {
    id: 2,
    product_id: 1,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Góc bếp sử dụng thiết bị gia dụng',
    sort_order: 2,
    is_primary: false,
    created_at: '2026-10-10T09:10:00',
  },
  {
    id: 3,
    product_id: 2,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Thiết bị nhà bếp',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-11T10:00:00',
  },
  {
    id: 4,
    product_id: 3,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Máy xay sinh tố',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-12T08:30:00',
  },
  {
    id: 5,
    product_id: 4,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Đồ dùng gia dụng',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-12T11:00:00',
  },
  {
    id: 6,
    product_id: 5,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1631545806609-8d4e7b0f9f73?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Thiết bị gia dụng trong nhà',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-13T13:00:00',
  },
  {
    id: 7,
    product_id: 6,
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=85',
    alt_text: 'Thiết bị điện gia dụng',
    sort_order: 1,
    is_primary: true,
    created_at: '2026-10-14T14:00:00',
  },
];
