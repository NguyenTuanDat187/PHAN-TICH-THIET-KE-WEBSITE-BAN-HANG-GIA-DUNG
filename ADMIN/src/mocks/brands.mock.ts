
import type { Brand } from '../types/brand.types';

const STORAGE_KEY = 'adminflux_brands';

export const brandsMock: Brand[] = [
  {
    id: 'BR001',
    name: 'Lock&Lock',
    slug: 'lock-lock',
    description: 'Thương hiệu đồ gia dụng và hộp bảo quản thực phẩm.',
    logoUrl: '',
    logo: '',
    website: 'https://www.locknlock.com',
    productCount: 28,
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'BR002',
    name: 'Sunhouse',
    slug: 'sunhouse',
    description: 'Thương hiệu thiết bị nhà bếp và đồ gia dụng.',
    logoUrl: '',
    logo: '',
    website: 'https://sunhouse.com.vn',
    productCount: 35,
    status: 'active',
    createdAt: '2026-01-12T08:00:00.000Z',
    updatedAt: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'BR003',
    name: 'Kangaroo',
    slug: 'kangaroo',
    description: 'Thương hiệu thiết bị gia dụng và máy lọc nước.',
    logoUrl: '',
    logo: '',
    website: 'https://kangaroo.vn',
    productCount: 21,
    status: 'active',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'BR004',
    name: 'Philips',
    slug: 'philips',
    description: 'Thương hiệu thiết bị điện gia dụng.',
    logoUrl: '',
    logo: '',
    website: 'https://www.philips.com',
    productCount: 19,
    status: 'active',
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
  },
  {
    id: 'BR005',
    name: 'Panasonic',
    slug: 'panasonic',
    description: 'Thương hiệu thiết bị điện và đồ gia dụng.',
    logoUrl: '',
    logo: '',
    website: 'https://www.panasonic.com',
    productCount: 24,
    status: 'active',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'BR006',
    name: 'Tefal',
    slug: 'tefal',
    description: 'Thương hiệu dụng cụ nấu ăn và thiết bị nhà bếp.',
    logoUrl: '',
    logo: '',
    website: 'https://www.tefal.com',
    productCount: 16,
    status: 'inactive',
    createdAt: '2026-01-22T08:00:00.000Z',
    updatedAt: '2026-01-22T08:00:00.000Z',
  },
  {
    id: 'BR007',
    name: 'Elmich',
    slug: 'elmich',
    description: 'Thương hiệu đồ gia dụng và dụng cụ nhà bếp.',
    logoUrl: '',
    logo: '',
    website: 'https://elmich.vn',
    productCount: 12,
    status: 'active',
    createdAt: '2026-01-25T08:00:00.000Z',
    updatedAt: '2026-01-25T08:00:00.000Z',
  },
  {
    id: 'BR008',
    name: 'Xiaomi',
    slug: 'xiaomi',
    description: 'Thương hiệu thiết bị điện tử và đồ gia dụng thông minh.',
    logoUrl: '',
    logo: '',
    website: 'https://www.mi.com',
    productCount: 18,
    status: 'inactive',
    createdAt: '2026-01-28T08:00:00.000Z',
    updatedAt: '2026-01-28T08:00:00.000Z',
  },
];

export function getBrands(): Brand[] {
  if (typeof window === 'undefined') {
    return brandsMock;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return brandsMock;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return brandsMock;
    }

    return parsed as Brand[];
  } catch {
    return brandsMock;
  }
}

export function saveBrands(brands: Brand[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(brands),
  );
}
