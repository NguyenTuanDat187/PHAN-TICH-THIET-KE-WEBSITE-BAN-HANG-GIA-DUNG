
import type {
  AttributeOption,
  AttributeValue,
} from '../types/attribute-value.types';

export const attributeOptionsMock: AttributeOption[] = [
  { id: 1, name: 'Màu sắc', slug: 'mau-sac' },
  { id: 2, name: 'Dung tích', slug: 'dung-tich' },
  { id: 3, name: 'Chất liệu', slug: 'chat-lieu' },
  { id: 4, name: 'Kích thước', slug: 'kich-thuoc' },
];

export const attributeValuesMock: AttributeValue[] = [
  { id: 1, attribute_id: 1, value: 'Trắng', slug: 'trang', created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: 2, attribute_id: 1, value: 'Đen', slug: 'den', created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: 3, attribute_id: 1, value: 'Xanh lá', slug: 'xanh-la', created_at: '2026-10-02', updated_at: '2026-10-02' },
  { id: 4, attribute_id: 2, value: '1 lít', slug: '1-lit', created_at: '2026-10-02', updated_at: '2026-10-02' },
  { id: 5, attribute_id: 2, value: '2 lít', slug: '2-lit', created_at: '2026-10-02', updated_at: '2026-10-02' },
  { id: 6, attribute_id: 3, value: 'Inox', slug: 'inox', created_at: '2026-10-03', updated_at: '2026-10-03' },
  { id: 7, attribute_id: 3, value: 'Nhựa', slug: 'nhua', created_at: '2026-10-03', updated_at: '2026-10-03' },
  { id: 8, attribute_id: 4, value: 'Nhỏ', slug: 'nho', created_at: '2026-10-04', updated_at: '2026-10-04' },
];
