
import type {
  AttributeValue,
  ProductAttribute,
} from '../types/attribute.types';

const now = new Date().toISOString();

function makeValues(
  attributeId: string,
  entries: Array<{ id: string; value: string; slug: string }>,
): AttributeValue[] {
  return entries.map((entry) => ({
    ...entry,
    attributeId,
    createdAt: now,
    updatedAt: now,
  }));
}

export const attributesMock: ProductAttribute[] = [
  {
    id: 'attr-001',
    name: 'Màu sắc',
    slug: 'mau-sac',
    values: makeValues('attr-001', [
      { id: 'val-001', value: 'Trắng', slug: 'trang' },
      { id: 'val-002', value: 'Đen', slug: 'den' },
      { id: 'val-003', value: 'Xám', slug: 'xam' },
      { id: 'val-004', value: 'Đỏ', slug: 'do' },
      { id: 'val-005', value: 'Xanh dương', slug: 'xanh-duong' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-002',
    name: 'Dung tích',
    slug: 'dung-tich',
    values: makeValues('attr-002', [
      { id: 'val-006', value: '500 ml', slug: '500-ml' },
      { id: 'val-007', value: '1 lít', slug: '1-lit' },
      { id: 'val-008', value: '1.5 lít', slug: '1-5-lit' },
      { id: 'val-009', value: '2 lít', slug: '2-lit' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-003',
    name: 'Chất liệu',
    slug: 'chat-lieu',
    values: makeValues('attr-003', [
      { id: 'val-010', value: 'Inox 304', slug: 'inox-304' },
      { id: 'val-011', value: 'Nhựa PP', slug: 'nhua-pp' },
      { id: 'val-012', value: 'Thủy tinh', slug: 'thuy-tinh' },
      { id: 'val-013', value: 'Gỗ', slug: 'go' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-004',
    name: 'Kích thước',
    slug: 'kich-thuoc',
    values: makeValues('attr-004', [
      { id: 'val-014', value: 'Nhỏ', slug: 'nho' },
      { id: 'val-015', value: 'Vừa', slug: 'vua' },
      { id: 'val-016', value: 'Lớn', slug: 'lon' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-005',
    name: 'Công suất',
    slug: 'cong-suat',
    values: makeValues('attr-005', [
      { id: 'val-017', value: '500W', slug: '500w' },
      { id: 'val-018', value: '1000W', slug: '1000w' },
      { id: 'val-019', value: '1500W', slug: '1500w' },
      { id: 'val-020', value: '2000W', slug: '2000w' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-006',
    name: 'Điện áp',
    slug: 'dien-ap',
    values: makeValues('attr-006', [
      { id: 'val-021', value: '220V', slug: '220v' },
      { id: 'val-022', value: '110V', slug: '110v' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-007',
    name: 'Kiểu dáng',
    slug: 'kieu-dang',
    values: makeValues('attr-007', [
      { id: 'val-023', value: 'Tròn', slug: 'tron' },
      { id: 'val-024', value: 'Vuông', slug: 'vuong' },
      { id: 'val-025', value: 'Chữ nhật', slug: 'chu-nhat' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'attr-008',
    name: 'Xuất xứ',
    slug: 'xuat-xu',
    values: makeValues('attr-008', [
      { id: 'val-026', value: 'Việt Nam', slug: 'viet-nam' },
      { id: 'val-027', value: 'Nhật Bản', slug: 'nhat-ban' },
      { id: 'val-028', value: 'Hàn Quốc', slug: 'han-quoc' },
    ]),
    createdAt: now,
    updatedAt: now,
  },
];

const STORAGE_KEY = 'adminflux_product_attributes';

export function getAttributes(): ProductAttribute[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed as ProductAttribute[];
      }
    }
  } catch {
    // Dùng dữ liệu mặc định nếu localStorage không đọc được.
  }

  return attributesMock.map((attribute) => ({
    ...attribute,
    values: attribute.values.map((value) => ({ ...value })),
  }));
}

export function saveAttributes(attributes: ProductAttribute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes));
}
    